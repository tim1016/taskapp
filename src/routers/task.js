const express = require('express');
const Task = require('../models/task');
const auth  = require('../middleware/auth');


const router = new express.Router();


router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id;

    try{
        const task = await Task.findOne({_id, owner: req.user._id});

        await req.user.populate('tasks').execPopulate();
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    } 
    catch(e){
        res.status(500).send(e);
    }
});

//GET /tasks?complteted=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req,res) => {

    const match = {};
    const sort ={};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    };

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === 'desc' ? -1: 1);
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: {
                    createdAt: -1 // 1 for ascending -1 for descending
                }
            }
        }).execPopulate();
        res.status(200).send(req.user.tasks);
    } catch(e){
        res.status(500).send(e)
    }
});


router.post('/tasks', auth, async (req,res)=>{
    const task = new Task({...req.body,
        owner: req.user._id});

    try{
        await task.save();
        res.status(201).send(task);
    } catch (e){
        res.status(400).send(e)
    }
    
});



router.patch('/tasks/:id', auth, async (req, res) =>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "status"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if(!isValidOperation){
        return res.status(400).send({error: "Invalid operation"})
    }

    try{
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id});
        if(!task){
            res.status(404).send();
        }

        updates.forEach(update=>{
            task[update] = req.body[update];
        })

        await task.save();        
        res.send(task);
    } catch(e) {
        res.status(500).send(e)
    }

})



router.delete('/tasks/:id', auth, async (req,res) =>{
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task){
            res.status(404).send({error: "Not found"})
        }
        res.send(task);

    }catch(e){
        res.status(500).send(e);
    }

})


module.exports = router;