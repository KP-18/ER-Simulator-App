import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Er.css';

const ErDiagram = () => {
  const [entities, setEntities] = useState([]);
  const [relations, setRelations] = useState([]);
  const { id } = useParams(); // Get the ID parameter from the URL

  useEffect(() => {
    const fetchEntitiesById = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/getOne/${id}`);
        setEntities(res.data.entities);
        setRelations(res.data.relationships);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEntitiesById();
  }, [id]);

  const getEntityNameById = (id) => {
    const entity = entities.find((entity) => entity._id === id);
    if (entity) {
      return entity.name;
    } else {
      return 'Untitled Entity';
    }
  };

  return (
    <div className="main-container">
      <div className="entities-container">
        <div className="entities-header">
          <h2>All Entities</h2>
          <button className="add-entity-btn">
            <Link to={`/entities/${id}`} className="link">
            Add/Update Entity
            </Link>
          </button>
        </div>
        <div className="entities-list">
          {entities.map((entity) => (
            <div key={entity._id} className="entity">
              <h3>Entity Name: {entity.name}</h3>
              <div className="attributes">
                {entity.attributes.map((attribute) => (
                  <div key={attribute._id} className="attribute">
                    <h4>Attribute Name: {attribute.name}</h4>
                    <p>Type: {attribute.dataType}</p>
                    {attribute.isPrimaryKey && <p>Primary Key</p>}
                    {attribute.isMultiValue && <p>Multivalued</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relations-container">
        <div className="relations-header">
          <h2>All Relations</h2>
          <button className="add-relation-btn">
            <Link to={`/relations/${id}`} className="link">
              Add/Update Relationships
            </Link>
          </button>
        </div>
        <div className="relations-list">
          {relations.map((relation) => (
            <div key={relation._id} className="relation">
              <h3>Relationship: {relation.name}</h3>
              <h4 className='From'>From: {getEntityNameById(relation.from)}</h4>
              <h4 className='To'>To: {getEntityNameById(relation.to)}</h4>
              <h4 className='Type'>Type: {relation.type}</h4>
              <div className="attributes">
                {relation.attributes.map((attribute) => (
                  <div key={attribute._id} className="attribute">
                    <h4>Attribute Name: {attribute.name}</h4>
                    <p>Type: {attribute.dataType}</p>
                    {attribute.isPrimaryKey && <p>Primary Key</p>}
                    {attribute.isMultiValue && <p>Multivalued</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="SQL"> 
      <button className="ddl-generator">
        <Link to={`/sql/${id}`} className="link">
          Generate DDL
        </Link>
      </button>
      </div>
    </div>
  );
};

export default ErDiagram;