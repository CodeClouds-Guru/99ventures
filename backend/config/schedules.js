const SurveySyncClass = require('../controllers/callback/SurveySyncController');


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
	// {
	// 	name: 'sago survey status check and update',
	// 	pattern: '*/20 * * * *',
	// 	function: async () => {
	// 		try {
	// 			let cronJob = new SurveySyncClass();
	// 			await cronJob.schlesingerSurveyUpdate();
	// 		} catch (e) {
	// 			console.log(e.message)
	// 		}
	// 	},
	// 	options: [null, true],
	// }
]

module.exports = schedules;