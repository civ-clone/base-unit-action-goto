import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import turnStart from './Rules/Player/turn-start';

ruleRegistryInstance.register(...turnStart());
