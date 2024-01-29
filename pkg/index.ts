import { AssertUnique } from './actions/unique';
import { AssertRelation } from './actions/relation';
import { AssertConstrained } from './actions/constrained';

export type { AssertUniqueType } from "./actions/unique";
export type { AssertRelationType } from "./actions/relation";

export default class MongoValidator {
    static assertUnique = AssertUnique;
    static assertRelation = AssertRelation;
    static assertConstrained = AssertConstrained;
}
