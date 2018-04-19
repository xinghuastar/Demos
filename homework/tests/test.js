QUnit.test( "test function 'vmResource'", function( assert ) {
		assert.expect( 3 );

		var res = new vmResource('bjstdmngbgr02.thoughtworks.com', ['ubuntu', 'firefox3', 'core-duo'], '|idle|192.168.1.2|/var/lib/cruise-agent');

		assert.equal(res.status, 'idle', 'status of new resource is correct!');
		assert.equal(res.name, 'bjstdmngbgr02.thoughtworks.com', 'name of new resource is correct!');
		assert.equal(res.type.length, 3, 'Resource type of new resource is correct!');
    });