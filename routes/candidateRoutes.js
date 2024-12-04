const express = require('express')
const router = express.Router();
const Candidate = require('../models/candidate');
const {jwtAuthMiddleware} = require('./../jwt');
const User = require('../models/user');

const checkAdminRole = async(userID) =>{
    try{
        const user = await User.findById(userID);
        return user.role === 'admin';
    }catch(err){
        return false;
    }
}

router.post('/',jwtAuthMiddleware, async (req, res) => {
    try {
        // console.log("------------------" + req.userPayload.id);
        if(! await checkAdminRole(req.userPayload.id)){
            return res.status(404).json({message: 'Aap admin nhi hai'});
        }
        const data = req.body
        const newCandidate = new Candidate(data);

        //await is used to hold the program until the newUser save function returns a promise. Or a new user is saved
        const response = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: response});

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/:candidateID',jwtAuthMiddleware, async(req, res)=>{
    try {
        if(!await checkAdminRole(req.userPayload.id)){
            return res.status(404).json({message: 'Aap admin nhi hai'});
        }
        
        // const candidateID = req.params.candidateID;
        // const updatedUserData = req.body;

        // await Candidate.findByIdAndUpdate(candidateID, updatedUserData, {
        //     new: true,
        //     runValidators: true
        // })

        const candidateID = req.params.candidateID;
        const updatedUserData = req.body;
        console.log("Updating candidate with ID:", candidateID, "with data:", updatedUserData);

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedUserData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        console.log("Update response:", response);
        res.status(200).json({ response: response });

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'User nhi mil rha' });
    }
})

router.delete('/:candidateID',jwtAuthMiddleware, async(req, res)=>{
    try {
        if(!await checkAdminRole(req.userPayload.id)){
            return res.status(404).json({message: 'Aap admin nhi hai'});
        }

        const candidateID = req.params.candidateID;
        console.log(candidateID)
        
        const response = await Candidate.findByIdAndDelete(candidateID);
        console.log("Delete response:", response);

        res.status(200).json({ message: 'Candidate deleted successfully' });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'User nhi mil rha' });
    }
})

module.exports = router;