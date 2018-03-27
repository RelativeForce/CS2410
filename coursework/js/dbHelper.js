function users(database){
	
	var sql = 'CREATE TABLE Users (';
	sql +='email TEXT PRIMARY KEY,';
	sql +='name TEXT NOT NULL,';
	sql +='dob TEXT NOT NULL,';
	sql +='organiser TEXT NOT NULL,';
	sql +='picture TEXT NOT NULL,';
	sql +='password TEXT NOT NULL,';
	sql +='salt TEXT NOT NULL,';
	sql +='telephone TEXT NOT NULL';
	sql +=');';
	
	database.run(sql);
	
}

function forEach(database, query, callback){
	
	database.serialize(() => {
		database.each(query, function(err, row){
			if (err) {
				throw err;
			}
			callback(row);
		});
	});
	
}


module.exports = {
	forEach : function(database, query, callback) {
		return forEach(database, query, callback);
	},
	users : function(database){
		return users(database);
	}
};