import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import FormField from './FormField';
import { v4 as uuidv4 } from 'uuid';
import './AddRelation.css'
const AddRelation = () => {
  const [relation , setRelation] = useState([{
    id: uuidv4(),
    name: "",
    from : "",
    to : "",
    type: "",
    attributes: [
        {
            id: uuidv4(),
            name: "",
            dataType: "",
            isPrimaryKey: false,
            isMultivalue: false
        }
    ]
  }]);

const [entities, setEntities] = useState([]);
  const {id} = useParams();
 
  useEffect(() => {
    const fetchData = async() => {
        try{
            const res = await axios.get(`http://localhost:8080/api/getOne/${id}`);
            // console.log(res.data.relationships);
            setRelation(res.data.relationships);
            setEntities(res.data.entities);
            console.log(res.data.entities);
        }catch(err){
          console.log(err);
        }
    }
   fetchData();
  },[id]);

   
  
  const handleChangeRel = (e, id) => {
    //  console.log("yess");
    const { name, value } = e.target;
    console.log(name);
    console.log(value);
    
    setRelation((prevRelations) =>
      prevRelations.map((rel) => {
        if (rel.id === id) {
          return { ...rel, [name]: name === 'to' || name === 'from' || name == 'type' ? (value === "SELECT" ? "" : value) : value  };
        } else {
          return rel;
        }
      })
    );
  };

  
// this is for the attributes  
const handleChange = (e, relationId, attId) => {
    const { name, value, checked } = e.target;
    setRelation(prevRelation => prevRelation.map(rel => {
        if (rel.id === relationId) {
            const attributes = rel.attributes.map(att => {
                if (att.id === attId) {
                    return {
                        ...att,
                        [name]: name === 'isPrimaryKey' || name === 'isMultivalue' ? checked : value
                    };
                }
                return att;
            });
            return {
                ...rel,
                attributes
            };
        }
        return rel;
    }));
};

const handleRemoveAttribute = (relationId, attId) => {
    setRelation(prevRelation => prevRelation.map(rel => {
        if (rel.id === relationId) {
            return {
                ...rel,
                attributes: rel.attributes.filter(att => att.id !== attId)
            }
        }
        return rel;
    }));
};
const handleAdd = (e) =>{
    e.preventDefault();
    setRelation([...relation,{
        id: uuidv4(),
        name: "",
        from:"",
        to:"",
        type:"",
        attributes: []
    }]);
}
const handleRemove = (relationId) => {
    const index = relation.findIndex(rel => rel.id === relationId);
    if (index !== -1) {
        const list = [...relation];
        list.splice(index, 1);
        setRelation(list);
    }
};

const handleAddAttribute = (e, relationId) => {
    e.preventDefault();

    setRelation(prevRelation => prevRelation.map(rel => {
        if (rel.id === relationId) {
            const attributes = [...rel.attributes, {
                id: uuidv4(),
                name: "",
                dataType: "",
                isPrimaryKey: false,
                isMultivalue: false
            }];
            return {
                ...rel,
                attributes
            };
        }
        return rel;
    }));
}

const handleSubmit = async (e) => {
    e.preventDefault();
    if(relation.length === 0){
        alert("Please add atleast one relation");
        return;
    }
    for(let i=0;i<relation.length;i++){
        if(relation[i].from === ""){
            alert("Please select from entity in",relation[i].name);
            return;
        }
        if(relation[i].to === ""){
            alert("Please select to entity in",relation[i].name);
            return;
        }
        if(relation[i].type === ""){
            alert("Please select type in",relation[i].name);
            return;
        }
    }
    console.log("Relation is fine");
    const relationships = {
        relationships: relation
    };
    console.log(relationships);
    try{
        await axios.post(`http://localhost:8080/api/postOneRelation/${id}`,relationships); //error
        alert("Relation Added Successfully");
        window.location.href = `/${id}`;
    }catch(err){
        console.log(err);
    }
}



  return (
    <div className="main-div">
      <h1>All Relationships</h1>
      <div className="relationships">
        { 
                relation.map((rel) =>{  //changes
                return(
                <div key={rel.id} className="single-relation">
                    <FormField
                    label ="Relation Name"
                    name="name"
                    value={rel.name || ''}
                    onChange={(e) => handleChangeRel(e, rel.id)}
                    />
                    {/* DROP DOWN FOR FROM ENTITY */}
                    <label className='from-lebel'>
                    From Entity
                    <select name="from" value={(rel.from) || 'SELECT' } onChange={(e) => handleChangeRel(e, rel.id)}>
                    <option value="SELECT">SELECT</option>
                    {entities.map((entity) => (
                        <option key={entity._id} value={entity._id}>
                        {entity.name}
                        </option>
                    ))}
                    </select>
                    </label>

                    {/* DROP DOWN FOR TO ENTITY */}
                    <label className='to-lebel'>
                    To Entity
                    <select name="to" value={(rel.to) || 'SELECT' } onChange={(e) => handleChangeRel(e, rel.id)}>
                    <option value="SELECT">SELECT</option>
                    {entities.map((entity) => (
                        <option key={entity._id} value={entity._id}>
                        {entity.name}
                        </option>
                    ))}
                    </select>
                    </label>

                    <label>Type
                    <select name="type" value={rel.type || "SELECT"} onChange={(e) => handleChangeRel(e, rel.id)}>
                    <option value="SELECT">SELECT</option>
                    <option value="one-to-one">One-to-One</option>
                    <option value="many-to-one">Many-to-One</option>
                    <option value="one-to-many">One-to-Many</option>
                    <option value="many-to-many">Many-to-Many</option>
                    </select>
                    </label>
                    {/* <FormField
                    label ="Type"
                    name="type"
                    value={rel.type || ''}
                    onChange={(e) => handleChangeRel(e, rel.id)}
                    /> */}
                   <div className="attributes">
                    {
                        rel.attributes.map((att) => {
                           return(
                            <div key={att.id} className="single-attribute">
                                <FormField
                                label="Attribute Name"
                                name="name"
                                value={att.name || ''}
                                onChange={e=>handleChange(e,rel.id,att.id)}
                                />
                                <FormField
                                label="Data Type"
                                name="dataType"
                                value={att.dataType || ''}
                                onChange={e=>handleChange(e,rel.id,att.id)}
                                />
                                <label>
                                <input
                                    type="checkbox"
                                    name="isPrimaryKey"
                                    checked={att.isPrimaryKey || false}
                                    onChange={e=>handleChange(e,rel.id,att.id)}
                                />
                                Is Primary Key
                                </label>
                                <label>
                                <input
                                    type="checkbox"
                                    name="isMultivalue"
                                    checked={att.isMultivalue || false}
                                    onChange={e=>handleChange(e,rel.id,att.id)}
                                />
                                Is Multivalue
                                </label>

                                {
                                  <button onClick={(e)=>handleAddAttribute(e,rel.id)}>Add Attribute</button>
                                }
                                {
                                  <button onClick={()=>handleRemoveAttribute(rel.id,att.id)}>Remove</button>
                                }
                            </div>
                           )
                        
        
                        })
                    }

                    {
                        rel.attributes.length === 0 &&
                        <button onClick={(e)=>handleAddAttribute(e,rel.id)}>Add Attribute</button>
                    }
                   </div>
                   { 
                        <button onClick={(e) => handleAdd(e)}>Add Relation</button>
                    }
                    { relation.length !== 1 && 
                        <button onClick={() => handleRemove(rel.id)}>Remove Relation</button>
                    }
                </div>
                )
            }
            )
        }
      </div>
      <div className="submitButton">
                {   relation.length === 0 &&
                        <button onClick={(e) => handleAdd(e)}>Add Relation</button>
                }
                <button  onClick={(e)=>handleSubmit(e)}>Submit Relation</button>
            </div>
    </div>
  )
}

export default AddRelation
