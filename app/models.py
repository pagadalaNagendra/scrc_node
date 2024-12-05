import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, ARRAY, Boolean, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from enum import Enum

class Vertical(Base):
    __tablename__ = "verticals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    parameters = relationship("Parameter", back_populates="vertical")
    nodes = relationship("Node", back_populates="vertical")

class Parameter(Base):
    __tablename__ = "parameters"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    min_value = Column(Float)
    max_value = Column(Float)
    vertical_id = Column(Integer, ForeignKey("verticals.id"))
    data_type = Column(String)
    vertical = relationship("Vertical", back_populates="parameters")

class Node(Base):
    __tablename__ = "nodes"
    node_id = Column(String, primary_key=True)
    parameter = Column(ARRAY(JSON))
    vertical_id = Column(Integer, ForeignKey("verticals.id"))
    platform = Column(String)
    protocol = Column(String)
    frequency = Column(Integer)
    services = Column(String)
    vertical = relationship("Vertical", back_populates="nodes")
    url = Column(String)
    port = Column(Integer)
    ccsp_id = Column(String, ForeignKey("ccsp.ccsp_id"), nullable=True, unique=True)
    om2m_id = Column(Integer, ForeignKey("om2m.id"), nullable=True, unique=True)
    ctop_id = Column(Integer, ForeignKey("ctop.id"), nullable=True, unique=True)
    mobius_id = Column(Integer, ForeignKey("mobius.mobius_id"), nullable=True, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # New field

    ccsp_data = relationship("Ccsp", back_populates="node", uselist=False)
    om2m_data = relationship("Om2m", back_populates="node", uselist=False)
    ctop_data = relationship("Ctop", back_populates="node", uselist=False)
    mobius_data = relationship("Mobius", back_populates="node", uselist=False)

class Ccsp(Base):
    __tablename__ = "ccsp"
    ccsp_id = Column(String, primary_key=True)
    ccsp_cert = Column(String)
    ccsp_key = Column(String)
    node = relationship("Node", back_populates="ccsp_data", uselist=False)

class Om2m(Base):
    __tablename__ = "om2m"
    id = Column(Integer, primary_key=True)
    om2m_username = Column(String)
    om2m_password = Column(String)
    node = relationship("Node", back_populates="om2m_data", uselist=False)

class Ctop(Base):
    __tablename__ = "ctop"
    id = Column(Integer, primary_key=True)
    ctop_token = Column(String)
    node = relationship("Node", back_populates="ctop_data", uselist=False)

class Mobius(Base):
    __tablename__ = "mobius"
    mobius_id = Column(Integer, primary_key=True)
    xm2m_origin = Column(String)
    xm2m_ri = Column(String)
    node = relationship("Node", back_populates="mobius_data", uselist=False)

class Simulation(Base):
    __tablename__ = "simulations"
    timestamp = Column(Integer, primary_key=True)
    node_ids = Column(ARRAY(String))
    platform = Column(String)
    parameter = Column(String)
    success = Column(Integer)  # Corrected field name
    failure = Column(Integer)
    user_id = Column(Integer)
    
class Alerts(Base):
    __tablename__ = "alerts"
    timestamp = Column(Integer, primary_key=True)
    node_id = Column(String)
    status_code = Column(Integer)
    error_message = Column(String)


class UserType(Enum):
    ADMIN = 1
    USER = 2
    GUEST = 3
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    user_type = Column(Integer, default=UserType.USER.value)
    platform_access= Column(ARRAY(String))
    verticals = Column(ARRAY(Integer))
    def __repr__(self):
        return f"<User {self.username}>"
    
class TokenTable(Base):
    __tablename__ = "token"
    user_id = Column(Integer)
    access_token = Column(String(450), primary_key=True)
    refresh_token = Column(String(450), nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.datetime.now)
    
    def __init__(self, user_id, access_token, refresh_token, status):
        self.user_id = user_id
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.status = status

    def __repr__(self):
        return f"<TokenTable(user_id={self.user_id}, access_token={self.access_token}, \
    refresh_token={self.refresh_token}, status={self.status})>"   

class predefined(Base):
    __tablename__ = "predefined"
    id = Column(Integer, primary_key=True)
    configuration = Column(ARRAY(JSON), nullable=False)
    sim_type = Column(String, nullable=False)
    user_id = Column(Integer, nullable=False)