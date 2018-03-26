function create(database){

	users(database);

}

function users(database){
	
	var sql = 'CREATE TABLE Users (';
	sql+='user_id INTEGER PRIMARY KEY,';
	sql+='name TEXT NOT NULL,';
	sql+='dob TEXT NOT NULL,';
	sql+='picture TEXT NOT NULL,';
	sql+='password TEXT NOT NULL,';
	sql+='email TEXT NOT NULL,';
	sql+='telephone TEXT NOT NULL';
	sql+=');';
	
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