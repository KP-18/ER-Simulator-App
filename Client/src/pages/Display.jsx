import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './display.css';
const Display = () => {
  const [er, setEr] = useState({
    name: '',
    entities: [],
    relationships: [],
  });
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8080/api/getOne/${id}`);
        // console.log(data);
        setEr({
          name: data.name,
          entities: data.entities,
          relationships: data.relationships,
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id]);

  const getEntityNameById = (id) => {
    const entity = er.entities.find((entity) => entity._id === id);
    return entity ? entity.name : 'Untitled Entity';
  };


  // get suitable form of erJson
function getERJson()
{
var erJson = {
name : er.name,
entities : [],
relationships : []
}
for(var i = 0 ; i < er.entities.length ; i++){
var entity = {
name : er.entities[i].name,
attributes : [],
foreignKeys : []
}
for(var j = 0 ; j < er.entities[i].attributes.length ; j++){
var attribute = {
name : er.entities[i].attributes[j].name,
type : er.entities[i].attributes[j].dataType,
isPrimaryKey : er.entities[i].attributes[j].isPrimaryKey,
isMultivalue : er.entities[i].attributes[j].isMultivalue
}
entity.attributes.push(attribute);
}
erJson.entities.push(entity);
}

for(var i = 0 ; i < er.relationships.length ; i++){
    var relationship = {
        name : er.relationships[i].name,
        from : getEntityNameById(er.relationships[i].from),
        to : getEntityNameById(er.relationships[i].to),
        type : er.relationships[i].type,
        attributes : []
    }

    for(var j = 0 ; j < er.relationships[i].attributes.length ; j++){
        var attribute = {
            name : er.relationships[i].attributes[j].name,
            type : er.relationships[i].attributes[j].dataType,
            isPrimaryKey : er.relationships[i].attributes[j].isPrimaryKey,
            isMultivalue : er.relationships[i].attributes[j].isMultivalue
        }
        relationship.attributes.push(attribute);
    }
    erJson.relationships.push(relationship);
}

return erJson;
}



  const otm_updateForeignKey = (jsonData, entityName, fromEntity, foreignColumn, rela) => {
    let keys = {};
    let keys2 = {};

    for (let i = 0; i < jsonData.entities.length; i++) {
      const entity = jsonData.entities[i];
      if (entity.name === fromEntity) {
        for (let j = 0; j < entity.attributes.length; j++) {
          if (entity.attributes[j].primaryKey === true) {
            keys = {
              name: `${entity.attributes[j].name}_fk`,
              localColumn: entity.attributes[j].name,
              foreignColumn: entity.attributes[j].name,
              foreignEntity: fromEntity,
            };
            keys2 = {
              name: `${entity.attributes[j].name}_fk`,
              type: entity.attributes[j].type,
              isPrimaryKey: false,
            };
            break;
          }
        }
        break;
      }
    }

    for (let i = 0; i < jsonData.entities.length; i++) {
      const Entity = jsonData.entities[i];
      Entity.foreignKeys.push(keys);
      Entity.attributes.push(keys2);
      for (let i = 0; i < rela.attributes.length; i++) {
        Entity.attributes.push({
          ...rela.attributes[i],
          primaryKey: false,
        });
      }
      if (Entity.name === entityName) {
        break;
      }
    }


    return jsonData;
  };

  const mtm_updateForeignKey = (jsonData, toEntity, fromEntity, rela) => {
    let key_1 = {};
    let key_2 = {};
    let fkey_1 = {};
    let fkey_2 = {};

    for (let i = 0; i < jsonData.entities.length; i++) {
      const entity = jsonData.entities[i];
      if (entity.name === fromEntity) {
        for (let j = 0; j < entity.attributes.length; j++) {
          if (entity.attributes[j].primaryKey === true) {
            key_1 = {
              name: entity.attributes[j].name,
              type: entity.attributes[j].type,
              isPrimaryKey: true,
            };

            fkey_1 = {
              name: `${entity.attributes[j].name}_fk`,
              localColumn: entity.attributes[j].name,
              foreignColumn: entity.attributes[j].name,
              foreignEntity: fromEntity,
            };
            break;
          }
        }
        break;
      }
    }

    for (let i = 0; i < jsonData.entities.length; i++) {
      const entity = jsonData.entities[i];
      if (entity.name === toEntity) {
        for (let j = 0; j < entity.attributes.length; j++) {
          if (entity.attributes[j].primaryKey === true) {
            key_2 = {
              name: entity.attributes[j].name,
              type: entity.attributes[j].type,
              isPrimaryKey: true,
            };

            fkey_2 = {
              name: `${entity.attributes[j].name}_fk`,
              localColumn: entity.attributes[j].name,
              foreignColumn: entity.attributes[j].name,
              foreignEntity: toEntity,
            };
            break;
          }
        }
        break;
      }
    }

    const newEntity = {
      name: `${toEntity}_${fromEntity}`,
      attributes: [],
      foreignKeys: [],
    };

    newEntity.attributes.push(key_1);
    newEntity.attributes.push(key_2);
    newEntity.foreignKeys.push(fkey_1);
    newEntity.foreignKeys.push(fkey_2);

    for (let i = 0; i < rela.attributes.length; i++) {
      newEntity.attributes.push({
        ...rela.attributes[i],
        primaryKey: false,
      });
    }

    jsonData.entities.push(newEntity);

    return jsonData;
  };

// not refactored

function relationalChanges(erJson)     
{       
        for(var i = 0 ; i < erJson.relationships.length ; i++){
        var rela = erJson.relationships[i]; // Assuming there is only one relationship in the JSON
        if (rela.type === "one-to-many") {
            var fromEntity = rela.from;
            var toEntity = rela.to;
            var foreignColumn = "new_foreign_column_name";
            erJson = otm_updateForeignKey(erJson, toEntity, fromEntity, foreignColumn , rela);
        }
        else if(rela.type === "many-to-one"){
            var fromEntity = rela.from;
            var toEntity = rela.to;
            var foreignColumn = "new_foreign_column_name";
            erJson = otm_updateForeignKey(erJson, fromEntity, toEntity, foreignColumn , rela); 
        }
        else if(rela.type === "many-to-many"){
            var fromEntity = rela.from;
            var toEntity = rela.to;
            erJson = mtm_updateForeignKey(erJson, toEntity, fromEntity, rela);
        
            
        }
        }
        return erJson;
}
// function createForeignKey(attribute, entityName) {
//   return {
//     name: attribute.name + "_fk",
//     localColumn: attribute.name,
//     foreignColumn: attribute.name,
//     foreignEntity: entityName,
//   };
// }

// function createAttribute(attribute, isMultivalue) {
//   return {
//     name: attribute.name,
//     type: attribute.type,
//     primaryKey: true,
//     isMultivalue: isMultivalue,
//   };
// }

// function createNewEntity(entityName, attribute1, attribute2, foreignKey) {
//   return {
//     id: "newentity",
//     name: "_multivalued_" + attribute2.name,
//     attributes: [attribute1, attribute2],
//     foreignKeys: [foreignKey],
//   };
// }

// function multivalue_handle(jsonData) {
//   for (let i = 0; i < jsonData.entities.length; i++) {
//     const entity = jsonData.entities[i];
//     let primaryKeyAttribute, multivalueAttribute;

//     for (let j = 0; j < entity.attributes.length; j++) {
//       const attribute = entity.attributes[j];

//       if (attribute.primaryKey) {
//         primaryKeyAttribute = attribute;
//       } else if (attribute.isMultivalue) {
//         multivalueAttribute = attribute;
//         attribute.isMultivalue = false;
//       }
//     }

//     if (primaryKeyAttribute && multivalueAttribute) {
//       const foreignKey = createForeignKey(primaryKeyAttribute, entity.name);
//       const attribute1 = createAttribute(
//         primaryKeyAttribute,
//         multivalueAttribute.isMultivalue
//       );
//       const attribute2 = createAttribute(multivalueAttribute, false);
//       const newEntity = createNewEntity(
//         entity.name,
//         attribute1,
//         attribute2,
//         foreignKey
//       );

//       entity.attributes.splice(
//         entity.attributes.indexOf(multivalueAttribute),
//         1,
//         attribute1
//       );
//       jsonData.entities.push(newEntity);
//     }
//   }
// }

      function createTable(erJson)
{
  console.log(erJson.entities.length);
  let res = "";

  for(let i = 0;i<erJson.entities.length;i++)
  {
    let sql = "CREATE TABLE "+erJson.entities[i].name+"(\n";
    if(erJson.entities[i].attributes !== undefined)
    {
      for(let j = 0;j<erJson.entities[i].attributes.length;j++)
      {
        sql += erJson.entities[i].attributes[j].name+" "+erJson.entities[i].attributes[j].type;
        if(erJson.entities[i].attributes[j].isPrimaryKey)
        {
          sql += " NOT NULL PRIMARY KEY";
        }
        if(j !== erJson.entities[i].attributes.length-1)
        {
          sql += ",";
        }
        sql += "\n";
      }
    }
    for(let j=0;j<erJson.entities[i].foreignKeys.length;j++)
    {
      sql += "FOREIGN KEY("+erJson.entities[i].foreignKeys[j].name+") REFERENCES "+erJson.entities[i].foreignKeys[j].foreignEntity+"("+erJson.entities[i].foreignKeys[j].foreignColumn+")";
      if(i !== erJson.entities[i].foreignKeys.length-1)
      {
        sql += ",";
      }
      sql += "\n";
    }
    sql += ");";
    res += sql + "\n\n";
    // console.log(sql + '\n');
  }
  return res;
}

const intermidiat = relationalChanges(getERJson(er));
// const erJson = multivalue_handle(intermidiat);
const ddlScript = createTable(intermidiat);

const handleCopyClick = () => {
  navigator.clipboard.writeText(ddlScript);
  alert("Copied to clipboard!");
};

return (
  <div className="main">
    <h1>DDL SCRIPT FOR {er.name}</h1>
    <div className="text-container">
      <pre>{ddlScript}</pre>
    </div>
    <div className="copy-button">
      <button onClick={handleCopyClick}>Copy</button>
    </div>
  </div>
);

}

export default Display
