import { UpdateConfig } from '@shared/hooks/use-config';
import { ConfigModel } from '@shared/models/config-model';

export interface TabProps {
	// The settings.
	config: ConfigModel;

	// Saves one setting.
	update: UpdateConfig;
}
