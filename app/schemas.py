from pydantic import BaseModel
from typing import List, Optional, Union, Dict
from fastapi import UploadFile
import datetime
from enum import Enum
class VerticalBase(BaseModel):
    name: str

class VerticalCreate(VerticalBase):
    pass

class VerticalUpdate(BaseModel):
    name: Optional[str] = None

class Vertical(VerticalBase):
    id: int
    name: str
    
    class Config:
        orm_mode = True

class ParameterBase(BaseModel):
    name: str
    min_value: float
    max_value: float
    vertical_id: int
    data_type: str

class ParameterCreate(ParameterBase):
    pass

class Parameter(ParameterBase):
    id: int
    name: str
    min_value: int
    max_value: int
    vertical_id: int
    data_type: str

    class Config:
        orm_mode = True

class CcspBase(BaseModel):
    ccsp_id: int
    ccsp_cert: str
    ccsp_key: str

class CcspCreate(CcspBase):
    pass

class Ccsp(CcspBase):
    ccsp_id: int
    node_id: str
    
    class Config:
        orm_mode = True

class Om2mBase(BaseModel):
    om2m_username: str
    om2m_password: str

class Om2mCreate(Om2mBase):
    pass

class Om2m(Om2mBase):
    id: int
    node_id: str
    
    class Config:
        orm_mode = True

class CtopBase(BaseModel):
    ctop_token: str

class CtopCreate(CtopBase):
    pass

class Ctop(CtopBase):
    id: int
    node_id: str
    
    class Config:
        orm_mode = True

class NodeBase(BaseModel):
    parameter: List[Dict[str, Union[str, float, int]]]
    vertical_id: int
    platform: str
    protocol: str
    frequency: int
    services: Optional[str]
    node_id: str
    url:str
    port: Optional[int]
    ccsp_id: Optional[int] = None
    om2m_id: Optional[int] = None
    ctop_id: Optional[int] = None
    om2m_user: Optional[str] = None
    om2m_pass: Optional[str] = None
    mobius_origin: Optional[str] = None
    mobius_ri: Optional[str] = None
    ctop_tkn: Optional[str] = None
    user_id: Optional[int] = None  # Add this line

class NodeCreate(NodeBase):
    pass

class NodeUpdate(BaseModel):
    platform: Optional[str] = None
    protocol: Optional[str] = None
    frequency: Optional[int] = None
    parameter: Optional[List[Dict[str, Union[str, float, int]]]] = None

class NodeWithDetails(BaseModel):
    node_id: str
    platform: str
    protocol: str
    frequency: int
    services: Optional[str]
    vertical_name: Optional[str]
    parameters: List[Parameter]
    ccsp_id: Optional[Ccsp]
    om2m_id: Optional[Om2m]
    ctop_id: Optional[Ctop]

    class Config:
        orm_mode = True

class Node(BaseModel):
    node_id: str
    parameter: List[Dict[str, Union[str, float, int]]]
    vertical_id: int
    platform: str
    protocol: str
    frequency: int
    services: str
    user_id: int  # Add this line
    ccsp_id: Optional[str] = None
    om2m_id: Optional[int] = None
    ctop_id: Optional[str] = None
    mobius_id: Optional[int] = None

    class Config:
        orm_mode = True
        from_attributes = True  # Add this line to enable from_orm

class NodeCCSP(BaseModel):
    node_id: str
    platform: str
    protocol: str
    frequency: int
    services: Optional[str]
    vertical_id: Optional[int]
    parameter: List[Dict[str, Union[str, float, int]]]
    url: str
    user_id: int
    # certificate_file: Optional[UploadFile]
    # key_file: Optional[UploadFile]
    class Config:
        orm_mode = True
        from_attributes = True  # Required to enable `from_orm` method

class SimulationBase(BaseModel):
    timestamp: int
    node_ids: List[str]
    platform: str
    parameter: str
    success: int
    failure: int
    user_id: int
    

class SimulationCreate(SimulationBase):
    pass

class SimulationUpdate(BaseModel):
    timestamp: Optional[int] = None
    node_ids: Optional[str] = None
    platform: Optional[str] = None
    parameter: Optional[str] = None
    success: Optional[int] = None
    failure: Optional[int] = None

class Simulation(SimulationBase):
    class Config:
        orm_mode = True
        from_attributes = True  # Add this line to enable from_orm


class MobiusBase(BaseModel):
    mobius_id: int
    xm2m_origin: str
    xm2m_ri: str
    
class MobiusCreate(MobiusBase):
    pass

class Mobius(MobiusBase):
    mobius_id: int
    xm2m_origin: str
    xm2m_ri: str
    
    class Config:
        orm_mode = True

class AlertsBase(BaseModel):
    timestamp: int
    node_id: str
    status_code: int
    error_message: str

class AlertsCreate(AlertsBase):
    pass

class AlertsUpdate(AlertsBase):
    pass

class Alerts(AlertsBase):
    
    class Config:
        orm_mode = True
        from_attributes = True

class UserCreate(BaseModel):
    username:str
    email:str
    password:str
    user_type:str
    platform_access: List[str]
    verticals: List[str]

class RequestDetails(BaseModel):
    email:str
    password:str
    
class AuthResponse(BaseModel):
    username: str
    access_token: str
    refresh_token: str
    userId: int
    role: str

class TokenCreate (BaseModel):
    user_id: str
    access_token: str
    refresh_token: str
    status: bool
    created_date: datetime.datetime
    
class logout(BaseModel):
    user_id: int
    access_token: str
    
class platformUpdate(BaseModel):
    username: str
    email: str
    role: Optional[str] = None
    platform_access: Optional[List[str]] = None
    
class deleteUser(BaseModel):
    username: str
    email: str

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
    

class SimType(str, Enum):
    single = "single"
    multiple = "multiple"

class PredefinedBase(BaseModel):
    configuration: List[RequestBody]
    sim_type: SimType
    user_id: int

class PredefinedCreate(PredefinedBase):
    pass

class PredefinedUpdate(BaseModel):
    configuration: Optional[List[RequestBody]] = None
    sim_type: Optional[SimType] = None
    user_id: Optional[int] = None

class Predefined(PredefinedBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True
