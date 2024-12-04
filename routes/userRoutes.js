const express = require('express')
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const Candidate = require('../models/candidate');

const isAdmin =true;

router.post('/signup', async (req, res) => {
    try {
        const data = req.body
        const newUser = new User(data);

        if(newUser.role==='admin' && isAdmin==true){
            res.status(500).json({mesage: "There can only be a single admin"})
        }

        //await is used to hold the program until the newUser save function returns a promise. Or a new user is saved
        else if(newUser.role==='admin'){
            isAdmin=true;
        }
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is: ", token);

        res.status(200).json({response: response, token: token});

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/login', async (req, res) => {
    try {
        const { aadharNumber, password } = req.body;

        const user = await User.findOne({ aadharNumber: aadharNumber });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'galat user hai' })
        }

        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        res.json({ token })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        //req.userPayload is a function that gets the current users token
        const userData = req.userPayload;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
})

router.put('/profile/password', jwtAuthMiddleware,  async(req,res)=>{
    try{
        const userId = req.userPayload;
        const {currentPassword, newPassword} = req.body;

        const user = await user.findById(userId);   

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({ error: 'galat password hai' })
        }

        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({message: "Password Updated"}); 

    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
})

router.get('/vote/count', async(req,res)=>{
    try{
        const candidates = await Candidate.find().sort({voteCount: 'desc'});
        const record = candidates.map((data)=>{
            return{
                name : data.name,
                party: data.party,
                voteCount: data.voteCount
            }
        })

        res.status(200).json({record}); 
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
})

router.put('/vote/:candidateId', jwtAuthMiddleware, async(req,res)=>{
    try{
        const user = await User.findById(req.userPayload.id);
        if(! user.role === 'admin'|| ! user.isVoted){
            const candidate = await Candidate.findById(req.params.candidateId);
            candidate.voteCount++;
            candidate.votes.push({user: user.id})
            user.isVoted = true;
            await candidate.save();
            await user.save();
            res.status(200).json({message: "Aapka vote save hogya hai"});
        }
        else{
            if(user.role === 'admin')
                res.status(500).json({message: "Admin vote nhi kar skta"});
            else{
                res.status(500).json({message: "Aap pehle vote kar chuke ho"});
            }
        }

    }catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;