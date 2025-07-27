const express = require('express');
const router = express.Router();
const workhoursController = require('../controllers/workhoursController');

router.get('/', workhoursController.getAllWorkHours);
router.get('/:id', workhoursController.getWorkHourById);
router.post('/', workhoursController.createWorkHour);
router.put('/:id', workhoursController.updateWorkHour);
router.delete('/:id', workhoursController.deleteWorkHour);

module.exports = router;
