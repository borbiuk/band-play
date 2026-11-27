import coverageMap from '../../coverage-map.json';

/** Id of a feature in `tests/coverage-map.json`; a typo fails the type check */
export type FeatureId = keyof typeof coverageMap.features;

/**
 * Test or describe details that label it with features of the coverage map. The epic of each feature comes from
 * the map, so a test cannot get a wrong epic. Allure reads the labels; the coverage script counts them.
 *
 * @param ids - One or more features the test checks.
 */
export function feature(...ids: FeatureId[]): {
	annotation: { type: string; description: string }[];
} {
	const epics = [...new Set(ids.map((id) => coverageMap.features[id].epic))];
	return {
		annotation: [
			...epics.map((epic) => ({
				type: 'allure.label.epic',
				description: epic,
			})),
			...ids.map((id) => ({
				type: 'allure.label.feature',
				description: id,
			})),
		],
	};
}
