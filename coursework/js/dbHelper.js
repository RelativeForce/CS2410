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

function events(database){
	
	var sql = 'CREATE TABLE Events (';
	sql +='event_id TEXT PRIMARY KEY,';
	sql +='name TEXT NOT NULL,';
	sql +='description TEXT NOT NULL,';
	sql +='organiser TEXT NOT NULL,';
	sql +='type TEXT NOT NULL,';
	sql +='time TEXT NOT NULL,';
	sql +='location TEXT NOT NULL,';
	sql +='popularity TEXT NOT NULL,';
	sql += 'FOREIGN KEY(organiser) REFERENCES Users(email)';
	sql +=');';
	
	database.run(sql);
	
}

function interest(database){
	
	var sql = 'CREATE TABLE Interest (';
	sql +='event_id TEXT NOT NULL,';
	sql +='student_email TEXT NOT NULL,';
	sql += 'FOREIGN KEY(event_id) REFERENCES Events(event_id)';
	sql += 'FOREIGN KEY(student_email) REFERENCES Users(email)';
	sql +=');';
	
	database.run(sql);
	
}

function pictures(database){
	
	var sql = 'CREATE TABLE Event_Pictures (';
	sql += 'picture TEXT PRIMARY KEY,';
	sql += 'event_id TEXT NOT NULL,';
	sql += 'FOREIGN KEY(event_id) REFERENCES Events(event_id)';
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
	},
	events : function(database){
		return events(database);
	},
	interest : function(database){
		return interest(database);
	},
	pictures : function(database){
		return pictures(database);
	}
};