from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request, Header, status
from pydantic import BaseModel
from typing import List, Dict
import asyncio
import requests
import random
import datetime
from fastapi.responses import StreamingResponse
import json
from sqlalchemy.orm import Session
from app import models, database  # Assuming you have a models module and a database module for session
import os
import time
from .. import crud
from app import schemas  # Assuming you have a schemas module
from app.auth import token_required
from app.config import settings
from jose import jwt, JWTError

router = APIRouter(prefix="/services", tags=["services"])

# Global dictionaries to store asyncio tasks, stop events, and events for each node
tasks: Dict[str, asyncio.Task] = {}
stop_events: Dict[str, asyncio.Event] = {}
node_events: Dict[str, List[Dict]] = {}  # Store events indexed by node_id

base_dir = os.path.dirname(os.path.abspath(__file__))
# Request body schemas
class Parameter(BaseModel):
    name: str
    min: float
    max: float

class RequestBody(BaseModel):
    node_id: str
    frequency: int
    parameters: List[Parameter]
    platform: str
    protocol: str

class ScheduleRequestBody(BaseModel):
    node_id: str
    start_time: str
    end_time: str
    frequency: int
    parameters: List[Parameter]
    platform: str
    protocol: str
class StopRequestBody(BaseModel):
    node_id: str
    
def write_log_to_file(log_message: dict, request: Request, user_name: str, user_id: int = None):
    # Retrieve the username from the cookies (session)
    
    
    log_message["username"] = user_name  # Add the username to the log message
    
    log_dir = os.path.join(base_dir, 'logs', str(user_id))
    
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, f"simulation.json")
    with open(log_file, 'a') as f:
        json.dump(log_message, f, indent=2)
        f.write(",\n")


def create_timestamped_log_file(timestamp: int, user_id: int):
    log_dir = os.path.join(base_dir, 'logs', str(user_id))
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, f"{timestamp}.json")
    with open(log_file, 'w') as f:
        json.dump({}, f, indent=2)

def copy_simulation_log(destination_file: str, user_id: int):
    log_file = os.path.join(base_dir, 'logs', str(user_id), 'simulation.json')
    destination_path = os.path.join(base_dir, 'logs', str(user_id), destination_file)
    if not os.path.exists(log_file):
        raise FileNotFoundError(f"{log_file} does not exist.")
            
    with open(log_file, 'r') as src, open(destination_path, 'w') as dst:
        dst.write(src.read())

# Dependency to get the DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to validate token
def validate_token(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing 'sub' field",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print("User ID",user_id)
    return user_id

# Helper function to generate random parameter data
def generate_parameters_data(parameters: List[Parameter]) -> List[Dict[str, float]]:
    data = []
    timestamp = datetime.datetime.now().isoformat()
    for param in parameters:
        value = round(random.uniform(param.min, param.max), 2)
        data.append({"timestamp": timestamp, "value": value})
    return data

# The ccsp function to send data to the CCSP platform
async def send_data_to_ccsp(db_node, parameters_data, frequency, stop_event: asyncio.Event, db: Session, request:Request, user_name: str, user_id: int):
    ccsp_info = db.query(models.Ccsp.ccsp_cert, models.Ccsp.ccsp_key).filter(models.Ccsp.ccsp_id == db_node.ccsp_id).first()
    
    if not ccsp_info:
        raise HTTPException(status_code=404, detail="CCSP info not found")

    cert_path, key_path = ccsp_info.ccsp_cert, ccsp_info.ccsp_key
    # url = f"https://ccsp.m2m.cdot.in/{db_node.ccsp_id}"
    if db_node.url.endswith('/'):
        url = db_node.url + db_node.ccsp_id
    else:
        url = db_node.url + '/' + db_node.ccsp_id
    headers = {
        'Content-Type': 'application/json;ty=4',
        'X-M2M-Origin': 'SOTIiithWQ1',
        'X-M2M-RI': 'SmartCityiiith',
        'X-M2M-RVI': '3',
        'Accept': 'application/json'
    }

    payload_json = {
        "m2m:cin": {"con": parameters_data}
    }

    while not stop_event.is_set():
        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload_json,
                cert=(cert_path, key_path),
                verify=False
            )
            
            # Log the response for the /events endpoint
            print(response.text)
            event = {
                "node_id": db_node.node_id,
                "status_code": response.status_code,
                "error": response.text if response.status_code != 200 else ""
            }
            write_log_to_file(event, request, user_name, user_id)
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)
            
            if response.status_code == 201:
                global success_counter
                success_counter += 1
            else:
                global failure_counter
                failure_counter += 1
        except Exception as e:
            event = {
                "node_id": db_node.node_id,
                "status_code": 500,
                "error": str(e)
            }
            write_log_to_file(event, request, user_name, user_id)
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)

        await asyncio.sleep(frequency)

async def send_data_to_om2m(db_node, parameters_data, frequency, stop_event: asyncio.Event, db: Session, request:Request, user_name: str, user_id: int):
    print(parameters_data, frequency)
    om2m_info = db.query(models.Om2m.om2m_username, models.Om2m.om2m_password).filter(models.Om2m.id == db_node.om2m_id).first()
    url = f"{db_node.url}:{db_node.port}/~/in-cse/in-name/AE-TEST/{db_node.node_id}/Data"
    headers = {
        'X-M2M-Origin': f'{om2m_info.om2m_username}:{om2m_info.om2m_password}',
        'Content-Type': 'application/json;ty=4'
    }
    payload_json = {
        "m2m:cin": {"con": str(parameters_data)}
    }
    while not stop_event.is_set():
        try:
            response  = requests.post(
                url,
                headers=headers,
                json=payload_json
            )
            event = {
                "node_id": db_node.node_id,
                "status_code": response.status_code,
                "error": response.text if response.status_code != 200 else ""
            }
            write_log_to_file(event, request, user_name, user_id)
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)
            
            if response.status_code == 201:
                global success_counter
                success_counter += 1
            else:
                global failure_counter
                failure_counter += 1
        except Exception as e:
            event = {
                "node_id": db_node.node_id,
                "status_code": 500,
                "error": str(e)
            }
            write_log_to_file(event, request, user_name, user_id)
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)
        await asyncio.sleep(frequency)
    
async def send_data_to_mobius(db_node,parameters_data, frequency,stop_event: asyncio.Event, db: Session, request:Request, user_name: str, user_id: int):
    mobius_info = db.query(models.Mobius.xm2m_origin, models.Mobius.xm2m_ri).filter(models.Mobius.mobius_id == db_node.mobius_id).first()
    url = f"{db_node.url}:{db_node.port}/Mobius/AE/{db_node.node_id}/Data?rcn=1"
    print("Url",url)
    headers = {
        'X-M2M-RI': mobius_info.xm2m_ri,
        'X-M2M-Origin': mobius_info.xm2m_origin + "AE",
        'Content-Type': 'application/json;ty=4'
    }
    print(headers)
    payload_json = {
        "m2m:cin": {"con": str(parameters_data)}
    }
    print(payload_json)
    while not stop_event.is_set():
        try:
            response  = requests.post(
                url,
                headers=headers,
                json=payload_json
            )
            print(response.text)
            event = {
                "node_id": db_node.node_id,
                "status_code": response.status_code,
                "error": response.text if response.status_code != 200 else ""
            }
            write_log_to_file(event,request,user_name,user_id)
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)
            
            if response.status_code == 201:
                global success_counter
                success_counter += 1
            else:
                global failure_counter
                failure_counter += 1
        except Exception as e:
            event = {
                "node_id": db_node.node_id,
                "status_code": 500,
                "error": str(e)
            }
            write_log_to_file(event,request, user_name, user_id)
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)
        await asyncio.sleep(frequency)


# PUT /start endpoint for handling multiple nodes
success_counter = 0
failure_counter = 0
@router.put("/start")
async def start(body: List[RequestBody],request: Request ,db: Session = Depends(get_db), user_id: int = Depends(validate_token)):
    print(user_id)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_name = user.username
    node_ids = ",".join([data.node_id for data in body])
    sim_nodes = [node.node_id for node in body]
    print("Sim nodes",sim_nodes)
    parameters = ",".join([str(data.parameters) for data in body])
    log_dir = os.path.join(base_dir, 'logs', str(user_id))
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, f"simulation.json")
    if os.path.exists(log_file):
        # Delete the file after sending the response
        os.remove(log_file)
    
    platform = body[0].platform
    timestamp = int(time.time())
    
    for node in body:
        db_node = db.query(models.Node).filter(models.Node.node_id == node.node_id).first()
        if not db_node:
            raise HTTPException(status_code=404, detail=f"Node {node.node_id} not found")

        # Change service state to start
        db_node.services = "start"
        db.commit()

        # Create a stop event for the node
        stop_event = asyncio.Event()
        stop_events[node.node_id] = stop_event

        # Check platform and start the appropriate function
        if db_node.ccsp_id:
            parameters_data = generate_parameters_data(node.parameters)
            task = asyncio.create_task(send_data_to_ccsp(db_node, parameters_data, node.frequency, stop_event, db, request, user_name, user_id))
            tasks[node.node_id] = task
        elif db_node.om2m_id:
            parameters_data = generate_parameters_data(node.parameters)
            print(parameters_data)
            task = asyncio.create_task(send_data_to_om2m(db_node, parameters_data, node.frequency, stop_event, db, request, user_name, user_id))
            tasks[node.node_id] = task
        elif db_node.ctop_id:
            event = {
                "node_id": db_node.node_id,
                "status_code": 200,
                "error": "",
                "message": "CTOP function triggered"
            }
            if db_node.node_id not in node_events:
                node_events[db_node.node_id] = []
            node_events[db_node.node_id].append(event)
        elif db_node.mobius_id:
            parameters_data = generate_parameters_data(node.parameters)
            task = asyncio.create_task(send_data_to_mobius(db_node, parameters_data, node.frequency, stop_event, db, request, user_name, user_id))
            tasks[node.node_id] = task
        else:
            raise HTTPException(status_code=400, detail=f"Node {node.node_id} has no valid platform ID")
    print(node_ids)
    print("Sim node type",type(sim_nodes))
    
    if(type(user_id) == str):
        user_id= int(user_id)
    simulation_data = {
        "node_ids": sim_nodes,
        "timestamp": timestamp,
        "parameter": parameters,
        "platform": platform,
        "success": 0,
        "failure": 0,
        "user_id": user_id
    }
    print(simulation_data.keys())
    print(simulation_data["node_ids"])
    crud.create_simulation(db=db, simulation=simulation_data)
    create_timestamped_log_file(timestamp, user_id)
    return {"message": "Started sending data to nodes"}

# PUT /stop endpoint for handling multiple nodes
@router.put("/stop")
async def stop(node_ids: List[StopRequestBody], db: Session = Depends(get_db), user_id: int = Depends(validate_token)):
    for node in node_ids:
        db_node = db.query(models.Node).filter(models.Node.node_id == node.node_id).first()
        if not db_node:
            raise HTTPException(status_code=404, detail=f"Node {node.node_id} not found")
        
        if db_node.services != "start":
            raise HTTPException(status_code=400, detail=f"Service for Node {node.node_id} is not running")

        # Change service state to stop
        db_node.services = "stop"
        db.commit()

        # Stop the asyncio task related to the node_id
        if node.node_id in tasks:
            stop_events[node.node_id].set()  # Signal the task to stop
            tasks[node.node_id].cancel()  # Cancel the task
            del tasks[node.node_id]
            del stop_events[node.node_id]

        # Clear the events for the node after stopping the task
        if node.node_id in node_events:
            del node_events[node.node_id]
            
    latest_simulation = db.query(models.Simulation).order_by(models.Simulation.timestamp.desc()).first()
    global success_counter
    global failure_counter
    print(success_counter, failure_counter)
    simulation_data = schemas.SimulationUpdate(success=success_counter, failure=failure_counter)
    crud.update_simulation(db=db, simulation_id=latest_simulation.timestamp, simulation_update=simulation_data, user_id=user_id)
    if latest_simulation:
        print("Pani cheyyavee dannam pedathanee plsssssssssssssssssssssssssssssssssssssssss----------------")
        destination_file = f"{latest_simulation.timestamp}.json"
        copy_simulation_log(destination_file, user_id)
    return {"message": "Service stopped for specified nodes"}


@router.put("/stop_all")
async def stop_all(db: Session = Depends(get_db), user_id: int = Depends(validate_token)):
    # Query all nodes with services set to "start"
    nodes = db.query(models.Node).filter(models.Node.services == "start").all()
    
    for node in nodes:
        # Change service state to stop
        node.services = "stop"
        db.commit()

        # Stop the asyncio task related to the node_id
        if node.node_id in tasks:
            stop_events[node.node_id].set()  # Signal the task to stop
            tasks[node.node_id].cancel()  # Cancel the task
            del tasks[node.node_id]
            del stop_events[node.node_id]

        # Clear the events for the node after stopping the task
        if node.node_id in node_events:
            del node_events[node.node_id]
            
    latest_simulation = db.query(models.Simulation).order_by(models.Simulation.timestamp.desc()).first()
    global success_counter
    global failure_counter
    simulation_data = schemas.SimulationUpdate(success=success_counter, failure=failure_counter)
    crud.update_simulation(db=db, simulation_id=latest_simulation.timestamp, simulation_update=simulation_data)
    print(success_counter, failure_counter)
    success_counter = 0
    failure_counter = 0
    print(success_counter, failure_counter)
    if latest_simulation:
        destination_file = f"{latest_simulation.timestamp}.json"
        copy_simulation_log(destination_file, user_id)
        
    return {"message": "All services stopped for all nodes"}
# GET /events endpoint to stream events to the frontend
@router.get("/events")
async def get_events():
    async def event_generator():
        while True:
            if not node_events:
                await asyncio.sleep(1)
                continue
            # Send current events in the queue for each node
            for node_id, events in node_events.items():
                for event in events:
                    yield f"data: {json.dumps(event)}\n\n"
                # Clear the events after sending
                node_events[node_id].clear()
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def scheduler_task(body: List[ScheduleRequestBody], db: Session, start_timestamp: int, end_timestamp: int, flag: int, request:Request, user_id: int, user_name: str):
    print("Scheduler task started")
    print(body)
    # Create a simulation record
    sim_nodes = [node.node_id for node in body]
    parameters = ",".join([str(data.parameters) for data in body])
    platform = body[0].platform
    simulation_data = {
        "node_ids": sim_nodes,
        "timestamp": start_timestamp,
        "parameter": parameters,
        "platform": platform,
        "success": 0,
        "failure": 0,
        "user_id": user_id
    }
    crud.create_simulation(db=db, simulation=simulation_data)
    
    while True:
        current_time = time.time()
        if start_timestamp <= current_time <= end_timestamp:
            if flag == 0:
                for node in body:
                    db_node = db.query(models.Node).filter(models.Node.node_id == node.node_id).first()
                    if not db_node:
                        raise HTTPException(status_code=404, detail=f"Node {node.node_id} not found")
                    db_node.services = "start"
                    db.commit()

                    stop_event = asyncio.Event()
                    stop_events[node.node_id] = stop_event

                    parameters_data = generate_parameters_data(node.parameters)
                    
                    if db_node.ccsp_id:
                        task = asyncio.create_task(send_data_to_ccsp(db_node, parameters_data, node.frequency, stop_event, db, request, user_name, user_id))
                    elif db_node.om2m_id:
                        task = asyncio.create_task(send_data_to_om2m(db_node, parameters_data, node.frequency, stop_event, db, request, user_name, user_id))
                    elif db_node.mobius_id:
                        task = asyncio.create_task(send_data_to_mobius(db_node, parameters_data, node.frequency, stop_event, db, request, user_name, user_id))
                    else:
                        raise HTTPException(status_code=400, detail=f"Node {node.node_id} has no valid platform ID")

                    tasks[node.node_id] = task
                flag = 1

            create_timestamped_log_file(int(current_time), user_id)
        elif current_time > end_timestamp:
            for node in body:
                if node.node_id in tasks:
                    stop_events[node.node_id].set()  # Signal the task to stop
                    tasks[node.node_id].cancel()  # Cancel the task
                    del tasks[node.node_id]
                    del stop_events[node.node_id]

            latest_simulation = db.query(models.Simulation).order_by(models.Simulation.timestamp.desc()).first()
            if latest_simulation:
                destination_file = f"{latest_simulation.timestamp}.json"
                copy_simulation_log(destination_file, user_id)
            print("Stopped")
            break  # Exit loop after stopping tasks
        else:
            pass
        await asyncio.sleep(1)

# Endpoint to start scheduler
@router.put("/start_scheduler")
async def start_scheduler(
    body: List[ScheduleRequestBody], 
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(validate_token)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_name = user.username
    flag=0
    start_timestamp = int(datetime.datetime.strptime(body[0].start_time, "%d-%m-%Y %H:%M:%S").timestamp())
    end_timestamp = int(datetime.datetime.strptime(body[0].end_time, "%d-%m-%Y %H:%M:%S").timestamp())
    print(start_timestamp, end_timestamp)
    background_tasks.add_task(scheduler_task, body, db, start_timestamp, end_timestamp, flag, request, user_id, user_name)

    return {"message": "Scheduler started in the background"}