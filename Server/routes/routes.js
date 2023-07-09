const express = require('express');
const { Attribute,ErDiagram,Entity,Relationship } = require("../models");
const router = express.Router()

//Post Method to create new erd in data base 
router.post('/post', async (req, res) => {
    const data = new ErDiagram({
        name : req.body.name,
        entities : [],
        relationships : [],
    })

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
});

// post entites of erd with id into database
router.post('/postOneEntity/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const data = await ErDiagram.findById(id);
        // console.log(data);
        // console.log(req.body.entities);
        data.entities = req.body.entities;
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

// post relations of erd with id into database
router.post('/postOneRelation/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const data = await ErDiagram.findById(id);
        data.relationships = req.body.relationships;
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

//to get all erds from database
router.get('/getAll', async (req, res) => {
    try{
        const data = await ErDiagram.find();
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

//to get one(id) erds from database
router.get('/getOne/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const data = await ErDiagram.findById(id);
        res.status(200).json(data)
        console.log(data);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

//to get one(id) erds' entites  from database
router.get('/getOneEntity/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const data = await ErDiagram.findById(id);
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

//to get one(id) erds' relations  from database
router.get('/getOneRelation/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const erd = await ErDiagram.findById(id);
        const data = erd.relationships;
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});


module.exports = router;