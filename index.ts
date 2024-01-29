import { AssertUnique } from './actions/unique';
import { AssertRelation } from './actions/relation';
import { AssertConstrained } from './actions/constrained';

export type { AssertUniqueType } from "./actions/unique";
export type { AssertRelationType } from "./actions/relation";

export default class MongoAssert {
    static unique = AssertUnique;
    static relation = AssertRelation;
    static constrained = AssertConstrained;
}
