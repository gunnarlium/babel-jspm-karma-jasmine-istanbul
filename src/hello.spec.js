/* global beforeEach, describe, expect, it */

import {hello} from './hello';
describe('hello', () => {

	it('should return Hello Foo', function () {
		expect(hello()).toEqual('Hello Foo');
	});
});
