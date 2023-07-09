import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import FormField from './FormField';
import { v4 as uuidv4 } from 'uuid';
import './addEntity.css'
const AddEntity = () => {

    const [entity, setEntity] = useState([{
        id: uuidv4(),
        name: "",
        attributes: [{
            id: uuidv4(),
            name: "",
            dataType: "",
            isPrimaryKey: false,
            isMultivalue: false
        }]
    }]);
    const {id} = useParams();
    useEffect(() => {

        const fetchData = async () => {
            try{
                const res = await axios.get(`http://localhost:8080/api/getOneEntity/${id}`);
                setEntity(res.data.entities);
            }catch(err){
                console.log(err);
            }
        }
        fetchData();
    },[id]);

    const handleChangeEnt = (e, id) => {
        // handle entity name change
        const { value } = e.target;
        setEntity(prevEntity => prevEntity.map(ent => {
            if (ent.id === id) {
                return {
                    ...ent,
                    name: value
                };
            }
            return ent;
        }));
    };

    const handleChange = (e, entityId, attId) => {
        // handle entity attribute change
        const { name, value, checked } = e.target;
        setEntity(prevEntity => prevEntity.map(ent => {
            if (ent.id === entityId) {
                const attributes = ent.attributes.map(att => {
                    if (att.id === attId) {
                        return {
                            ...att,
                            [name]: name === 'isPrimaryKey' || name === 'isMultivalue' ? checked : value
                        };
                    }
                    return att;
                });
                return {
                    ...ent,
                    attributes
                };
            }
            return ent;
        }));
    };
    
    const handleRemoveAttribute = (entityId, attId) => {
        setEntity(prevEntity => prevEntity.map(ent => {
            if (ent.id === entityId) {
                return {
                    ...ent,
                    attributes: ent.attributes.filter(att => att.id !== attId)
                }
            }
            return ent;
        }));
    };

    const handleAdd = (e) =>{
        e.preventDefault();

        setEntity([...entity,{
            id: uuidv4(),
            name: "",
            attributes: []
        }]);
    }

    const handleRemove = (entityId) => {
        const index = entity.findIndex(ent => ent.id === entityId);
        if (index !== -1) {
            const list = [...entity];
            list.splice(index, 1);
            setEntity(list);
        }
    };

    const handleAddAttribute = (e, entityId) => {
        e.preventDefault();

        setEntity(prevEntity => prevEntity.map(ent => {
            if (ent.id === entityId) {
                const attributes = [...ent.attributes, {
                    id: uuidv4(),
                    name: "",
                    dataType: "",
                    isPrimaryKey: false,
                    isMultivalue: false
                }];
                return {
                    ...ent,
                    attributes
                };
            }
            return ent;
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(entity.length === 0){
            alert("Please add atleast one entity");
        }
        else{
            for(let i=0;i<entity.length;i++){
                if(entity[i].name === ""){
                    alert("Please enter entity name");
                    return;
                }
                if(entity[i].attributes.length === 0){
                    alert("Please add atleast one attribute");
                    console.log(entity[i]);
                    return;
                }
                for(let j=0;j<entity[i].attributes.length;j++){
                    if(entity[i].attributes[j].name === ""){
                        alert("Please enter attribute name");
                        return;
                    }
                }
            }
        }
        console.log("entity is fine");
        const entities = {
            entities: entity
        };
        console.log(entities);
        try{
            await axios.post(`http://localhost:8080/api/postOneEntity/${id}`,entities);
            alert("Entity Added Successfully");
            window.location.href = `/${id}`;
        }catch(err){
            console.log(err);
        }
    }

  return (
    <div className="main-div">
        <h1>All Entities</h1>
        <div className="entities">
            {
               entity.map((ent) => {
                    return(
                        <div key={ent.id} className="single-entity">
                               <FormField
                                label="Entity Name"
                                name="name"
                                value={ent.name}
                                onChange={(e) => handleChangeEnt(e, ent.id)}
                                />
                                <div className="attributes">
                                    {
                                        ent.attributes.map((att) =>{
                                            return(
                                                <div key ={att.id}className="single-attribute">
                                                <FormField
                                                    label="Attribute Name"
                                                    name="name"
                                                    value={att.name}
                                                    onChange={e=>handleChange(e,ent.id,att.id)}
                                                    />
                                                <FormField
                                                    label="Data Type"
                                                    name="dataType"
                                                    value={att.dataType}
                                                    onChange={e=>handleChange(e,ent.id,att.id)}
                                                    />
                                                <label>
                                                <input
                                                        type="checkbox"
                                                        name="isPrimaryKey"
                                                        checked={att.isPrimaryKey}
                                                        onChange={e=>handleChange(e,ent.id,att.id)}
                                                />
                                                Is Primary Key
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="isMultivalue"
                                                        checked={att.isMultivalue}
                                                        onChange={e=>handleChange(e,ent.id,att.id)}
                                                    />
                                                    Is Multivalue
                                                </label>
                                                    {
                                                    <button onClick={(e)=>handleAddAttribute(e,ent.id)}>Add Attribute</button>
                                                    }
                                                    {
                                                    <button onClick={()=>handleRemoveAttribute(ent.id,att.id)}>Remove</button>
                                                    }

                                            </div>
                                            )
                                        })
                                    }
                                    {
                                        ent.attributes.length === 0 &&
                                        <button onClick={(e)=>handleAddAttribute(e,ent.id)}>Add Attribute</button>
                                    }
                                </div>
                    { 
                        <button onClick={(e) => handleAdd(e)}>Add Entity</button>
                    }
                    { entity.length !== 1 && 
                        <button onClick={() => handleRemove(ent.id)}>Remove Entity</button>
                    }
                    </div>
                )
                })
            }

        </div>
            <div className="submitButton">
                { entity.length === 0 &&
                        <button onClick={(e) => handleAdd(e)}>Add Entity</button>
                }
                <button  onClick={(e)=>handleSubmit(e)}>Submit Entities</button>
            </div>
    </div>
  )
}

export default AddEntity;
