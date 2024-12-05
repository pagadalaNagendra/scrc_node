from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
from .om2m import om2m
from .mobius import mobius_function

# CRUD operations for Vertical (already defined)

# Get a list of verticals with pagination (skip and limit)
def get_verticals(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Vertical).all()

# Create a new vertical, ensuring there are no duplicates
def create_vertical(db: Session, vertical: schemas.VerticalCreate):
    existing_vertical = db.query(models.Vertical).filter(models.Vertical.name == vertical.name).first()
    if existing_vertical:
        raise HTTPException(status_code=400, detail="Vertical with this name already exists.")
    
    # Add the new vertical to the database
    db_vertical = models.Vertical(name=vertical.name)
    try:
        db.add(db_vertical)
        db.commit()
        db.refresh(db_vertical)
    except IntegrityError:
        db.rollback()  # Rollback the transaction in case of any integrity error
        raise HTTPException(status_code=400, detail="Vertical with this name already exists.")
    return db_vertical

# Update an existing vertical by its ID, returning None if not found
def update_vertical(db: Session, vertical_id: int, vertical: schemas.VerticalUpdate):
    db_vertical = db.query(models.Vertical).filter(models.Vertical.id == vertical_id).first()
    if db_vertical is None:
        return None
    # Update only the fields that have new values (skip empty values)
    for var, value in vars(vertical).items():
        setattr(db_vertical, var, value) if value else None
    db.commit()
    db.refresh(db_vertical)
    return db_vertical

# Delete a vertical by its ID, returning None if not found
def delete_vertical(db: Session, vertical_id: int):
    db_vertical = db.query(models.Vertical).filter(models.Vertical.id == vertical_id).first()
    if db_vertical is None:
        return None
    db.delete(db_vertical)  # Delete the vertical from the database
    db.commit()
    return db_vertical


# CRUD operations for Parameter

# Create a new parameter in the database
def create_parameter(db: Session, parameter: schemas.ParameterCreate):
    db_parameter = models.Parameter(**parameter.dict())
    db.add(db_parameter)
    db.commit()
    db.refresh(db_parameter)
    return db_parameter

# Get a parameter by its ID
def get_parameter(db: Session, parameter_id: int):
    return db.query(models.Parameter).filter(models.Parameter.id == parameter_id).first()

# Get a list of parameters with pagination (skip and limit)
def get_parameters(db: Session, skip: int = 0, limit: int = 10):
    parameters = db.query(models.Parameter).offset(skip).limit(limit).all()
    for parameter in parameters:
        print(parameter.id)
        print(parameter.name)
    return parameters

# Get a list of parameters by vertical ID with pagination
def get_parameters_by_vertical(db: Session, vertical_id: int, skip: int = 0, limit: int = 10):
    return db.query(models.Parameter).filter(models.Parameter.vertical_id == vertical_id).all()

# Update a parameter by its ID with new values, skipping unset values
def update_parameter(db: Session, parameter_id: int, parameter_update: schemas.ParameterCreate):
    db_parameter = db.query(models.Parameter).filter(models.Parameter.id == parameter_id).first()
    if db_parameter is None:
        return None
    # Update only the fields that are provided
    for key, value in parameter_update.dict(exclude_unset=True).items():
        setattr(db_parameter, key, value)
    db.commit()
    db.refresh(db_parameter)
    return db_parameter

# Delete a parameter by its ID, returning None if not found
def delete_parameter(db: Session, parameter_id: int):
    db_parameter = db.query(models.Parameter).filter(models.Parameter.id == parameter_id).first()
    if db_parameter is None:
        return None
    db.delete(db_parameter)  # Remove the parameter from the database
    db.commit()
    return db_parameter


# CRUD operations for Node

# Create a new node with default services value set to 'stop'
def create_node(db: Session, node: schemas.NodeCreate):
    # If no services value is provided, set it to 'stop'
    services = node.services if node.services is not None else 'stop'
    print(node)
    if node.om2m_user is not None:
        om2m_id = om2m(node.node_id, node.om2m_user, node.om2m_pass, node.url, node.port)
        print(om2m_id)
        om2m_db = models.Om2m(
            om2m_username=node.om2m_user,
            om2m_password=node.om2m_pass
        )
        try:
            db.add(om2m_db)
            db.commit()
            db.refresh(om2m_db)
            print(f"OM2M ID: {om2m_db.id}")  # Print the generated ID
        except IntegrityError:
            db.rollback()  # Rollback the transaction if the node already exists
            raise HTTPException(status_code=400, detail="Node with this ID already exists.")
        print(node.parameter)
        db_node = models.Node(
            node_id=node.node_id,
            parameter=node.parameter,
            vertical_id=node.vertical_id,
            platform=node.platform,
            protocol=node.protocol,
            frequency=node.frequency,
            om2m_id=om2m_db.id,
            ctop_id=None,
            ccsp_id=None,
            url=node.url,
            port=node.port,
            services=services,  # Include services field
            user_id=node.user_id  # Add this line
        )
    elif node.mobius_origin is not None:
        mobius_res = mobius_function(node.node_id, node.mobius_ri, node.mobius_origin, node.url, node.port)
        if mobius_res is None:
            raise HTTPException(status_code=400, detail="Node with this ID already exists.")
        mobius_db = models.Mobius(
            xm2m_origin=node.mobius_origin,
            xm2m_ri=node.mobius_ri
        )
        try:
            db.add(mobius_db)
            print("added")
            db.commit()
            print("commited")
            db.refresh(mobius_db)
            print("refreshed")
            print(f"Mobius ID: {mobius_db.mobius_id}")  # Print the generated ID
        except IntegrityError:
            db.rollback()  # Rollback the transaction if the node already exists
            raise HTTPException(status_code=400, detail="Node with this ID already exists.")
        print("Mobius")
        db_node = models.Node(
            node_id=node.node_id,
            parameter=node.parameter,
            vertical_id=node.vertical_id,
            platform=node.platform,
            protocol=node.protocol,
            frequency=node.frequency,
            om2m_id=None,
            ctop_id=None,
            ccsp_id=None,
            mobius_id=mobius_db.mobius_id,
            url=node.url,
            port=node.port,
            services=services,  # Include services field
            user_id=node.user_id  # Add this line
        )
    else:
        db_node = models.Node(
            node_id=node.node_id,
            parameter=node.parameter,
            vertical_id=node.vertical_id,
            platform=node.platform,
            protocol=node.protocol,
            frequency=node.frequency,
            om2m_id=None,
            ctop_id=None,
            ccsp_id=None,
            mobius_id=None,
            url=node.url,
            port=node.port,
            services=services,  # Include services field
            user_id=node.user_id  # Add this line
        )
        
    # Try to add the node to the database, handle duplicate ID error
    try:
        db.add(db_node)
        db.commit()
        print("commited")
        db.refresh(db_node)
        print("refreshed")
    except IntegrityError:
        db.rollback()  # Rollback the transaction if the node already exists
        raise HTTPException(status_code=400, detail="Node with this ID already exists.")
    if db_node:
        return True
    else:
        return False

def get_node(db: Session, node_id: str, user_id: int):
    return db.query(models.Node).filter(models.Node.node_id == node_id, models.Node.user_id == user_id).first()

# Get a list of nodes with pagination (skip and limit)
def get_nodes(db: Session, skip: int = 0, limit: int = 10, platforms: list[str] = None, verticals: list[str] = None, user_id: int = None):
    print("List ", platforms)
    query = db.query(models.Node).filter(models.Node.user_id == user_id)
    if platforms:
        platform_filters = [models.Node.platform.ilike(f"%{platform.lower()}%") for platform in platforms]
        query = query.filter(or_(*platform_filters))
    if verticals:
        query = query.filter(models.Node.vertical_id.in_(verticals))
    return query.offset(skip).limit(limit).all()

# Update a node by its ID with new values, including validation for services field
def update_node(db: Session, node_id: str, node_update: schemas.NodeUpdate, user_id: int):
    db_node = db.query(models.Node).filter(models.Node.node_id == node_id, models.Node.user_id == user_id).first()
    if db_node is None:
        raise HTTPException(status_code=404, detail="Node not found")
    
    # Handle updates for the node, including services validation
    for key, value in node_update.dict(exclude_unset=True).items():
        if key == 'services' and value not in ['start', 'stop']:
            raise HTTPException(status_code=400, detail="Invalid value for services. Must be 'start' or 'stop'.")
        setattr(db_node, key, value)
    
    # Commit the updates to the database
    try:
        db.commit()
        db.refresh(db_node)
    except IntegrityError:
        db.rollback()  # Rollback in case of error during update
        raise HTTPException(status_code=400, detail="Error updating node")
    
    return db_node

# Delete a node by its node_id, returning a success message or 404 if not found
def delete_node(db: Session, node_id: str, user_id: int):
    db_node = db.query(models.Node).filter(models.Node.node_id == node_id, models.Node.user_id == user_id).first()
    if db_node is None:
        raise HTTPException(status_code=404, detail="Node not found")

    db.delete(db_node)  # Remove the node from the database
    db.commit()
    return {"detail": "Node deleted successfully"}

# CRUD operations for Simulation

# Create a new simulation in the database
def create_simulation(db: Session, simulation: schemas.SimulationCreate):
    # Ensure simulation is a Pydantic model instance
    print(simulation)
    print(type(simulation))
    print("Creating simulation record")
    if isinstance(simulation, dict):
        simulation = schemas.SimulationCreate(**simulation)
    print(simulation.dict())
    db_simulation = models.Simulation(**simulation.dict())
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    return db_simulation

# Get a simulation by its ID and user_id
def get_simulation(db: Session, simulation_id: int, user_id: int):
    return db.query(models.Simulation).filter(models.Simulation.timestamp == simulation_id, models.Simulation.user_id == user_id).first()

# Get a list of simulations with pagination (skip and limit) and user_id
def get_simulations(db: Session, user_id: int = None):
    query = db.query(models.Simulation).filter(models.Simulation.user_id == user_id)
    return query.all()

# Update a simulation by its ID and user_id with new values, skipping unset values
def update_simulation(db: Session, simulation_id: int, simulation_update: schemas.SimulationUpdate, user_id: int):
    db_simulation = db.query(models.Simulation).filter(models.Simulation.timestamp == simulation_id, models.Simulation.user_id == user_id).first()
    if db_simulation is None:
        return None
    # Ensure simulation_update is a Pydantic model instance
    if isinstance(simulation_update, dict):
        simulation_update = schemas.SimulationUpdate(**simulation_update)
    for key, value in simulation_update.dict(exclude_unset=True).items():
        setattr(db_simulation, key, value)
    db.commit()
    db.refresh(db_simulation)
    return db_simulation

# Delete a simulation by its ID and user_id, returning None if not found
def delete_simulation(db: Session, simulation_id: int, user_id: int):
    db_simulation = db.query(models.Simulation).filter(models.Simulation.timestamp == simulation_id, models.Simulation.user_id == user_id).first()
    if db_simulation is None:
        return None
    db.delete(db_simulation)  # Remove the simulation from the database
    db.commit()
    return db_simulation

def create_ccsp_node(db: Session, node: schemas.NodeCCSP, ccsp_id, cert_path, key_path):
    if isinstance(node, str):
        node = schemas.NodeCreate.parse_raw(node)

    services = node.services if node.services is not None else 'stop'
    # Create a new node object with all fields, including services
    if all(isinstance(param, dict) for param in node.parameter):
        processed_parameters = node.parameter
    else:
        processed_parameters = [param.dict() for param in node.parameter]

    db_node = models.Node(
        node_id=node.node_id,
        parameter=processed_parameters,
        vertical_id=node.vertical_id,
        platform=node.platform,
        protocol=node.protocol,
        frequency=node.frequency,
        ccsp_id=ccsp_id,
        url=node.url,
        port=None,
        om2m_id=None,  # Default value set to None
        ctop_id=None,  # Default value set to None
        services=services,
        user_id=node.user_id  # Add this line
    )

    # Create a new ccsp object with relevant fields
    db_ccsp = models.Ccsp(
        ccsp_id=ccsp_id,
        ccsp_cert=cert_path,
        ccsp_key=key_path
    )

    # Try to add both node and ccsp to the database
    try:
        db.add(db_node)
        db.add(db_ccsp)
        print("added")
        db.commit()
        print("commited")
        db.refresh(db_node)
        db.refresh(db_ccsp)
        print("refreshed")
    except IntegrityError as e:
        db.rollback()  # Rollback the transaction if any error occurs
        raise HTTPException(status_code=400, detail=str(e))
    print("returning")
    return db_node