const SurveySyncClass = require('../controllers/callback/SurveySyncController');
const TicketControllerClass = require('../controllers/backend/TicketController');


const schedules = [
	{
		name: 'purespectrum survey',
		pattern: '*/5 * * * *',
		function: async () => {
			try {
				let cronJob = new SurveySyncClass()
				await cronJob.pureSpectrumSurveySaveToSQS();
			} catch (e) {
				console.log(e.message)
			}
		},
		options: [null, true],
	},
	{
		name: 'sago survey',
		pattern: '*/5 * * * *',
		function: async () => {
			try {
				let cronJob = new SurveySyncClass();
				await cronJob.schlesingerSurveySaveToSQS();
			} catch (e) {
				console.log(e.message)
			}
		},
		options: [null, true],
	},
	{
		name: 'sago survey status check and update',
		pattern: '*/20 * * * *',
		function: async () => {
			try {
				let cronJob = new SurveySyncClass();
				await cronJob.schlesingerSurveyUpdate();
			} catch (e) {
				console.log(e.message)
			}
		},
		options: [null, true],
	},
	{
		name: 'purespectrum survey status check and update',
		pattern: '*/20 * * * *',
		function: async () => {
			try {
				let cronJob = new SurveySyncClass();
				await cronJob.pureSpectrumSurveyUpdate();
			} catch (e) {
				console.log(e.message)
			}
		},
		options: [null, true],
	},
	{
		name: 'lucid survey status check and update',
		pattern: '*/20 * * * *',
		function: async () => {
			try {
				let cronJob = new SurveySyncClass();
				await cronJob.lucidSurveyUpdate();
			} catch (e) {
				console.log(e.message)
			}
		},
		options: [null, true],
	},
	{
		name: 'remove ticket attachment before 30days',
		pattern: '0 0 * * *',	//Once per day
		function: async () => {
			try {
				let cronJob = new TicketControllerClass();
				await cronJob.removeAttachments();
			} catch (e) {
				console.log(e.message)
			}
		},
		options: [null, true],
	},
	// {
	// 	name: 'remove those surveys which have been disabled and not used by any user',
	// 	pattern: '0 * * * *',	//Once per hour
	// 	// pattern: '0 0 * * *',	//Once per day
	// 	function: async () => {
	// 		try {
	// 			let cronJob = new SurveySyncClass();
	// 			await cronJob.removeSurvey();
	// 		} catch (e) {
	// 			console.log(e.message)
	// 		}
	// 	},
	// 	options: [null, true],
	// }
]

module.exports = schedules;