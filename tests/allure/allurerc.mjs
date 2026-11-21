import { defineConfig } from 'allure';

// Run the Allure commands from the repository root: the paths below are relative to it.
// The history file keeps one line per run; the master workflow restores it before the report is generated.
export default defineConfig({
	name: 'Band Play',
	output: './allure-report',
	historyPath: './allure-history/history.jsonl',
	historyLimit: 200,
	plugins: {
		awesome: {
			options: {
				groupBy: ['epic', 'feature'],
			},
		},
	},
});
