const async      = require('async');
const chai       = require('chai');
const expect     = chai.expect;

var config = {
  db: {
    url:'mongodb://localhost:27017/test'
  }
};

describe('messages library', function() {
  var messages;
  const validMessages = [
    {
      username:'Alice',
      text:'Alice\'s Message'
    },
    {
      username:'Bob',
      text:'Bob\'s Message'
    }
  ];

  function testEmpty(done){
    return function(){
      messages.readAll(function(err,res){
        expect(err).to.be.null;
        expect(res).to.be.an('array');
        expect(res).to.be.empty;

        done();
      });
    };
  }

  //Conncet the messages library to the DB before running the test.
  before(function(done){
    messages = require('../lib/messages.js')(
      config.db.url,
      function(err){
        if(err) return done(new Error(err));
        done();
      }
    );
  });

  //Ensure that all messages are removed from the database before each test to
  //prevent the result of one test affecting the next.
  beforeEach(function(done){
    messages.deleteAll(function(err){
      if(err) return done(new Error(err));
      done();
    });
  });

  //Disconnect the messages library from the DB after running all tests.
  after(function(){
    messages.disconnect();
  });

  /* 1.2 Simple create and read*/
  it('messages.create() can create a message given data with username and ' +
     'text properties. It returns a copy of the message with matching username'+
     ' and text properties and an _id property.',function(done){
    const MESSAGE_IDX = 0;
    messages.create(validMessages[MESSAGE_IDX],function(err,res){
      expect(err).to.be.null;
      expect(res).to.be.an('object');

      expect(res).to.have.property('username');
      expect(res.username).to.equal(validMessages[MESSAGE_IDX].username);

      expect(res).to.have.property('text');
      expect(res.text).to.equal(validMessages[MESSAGE_IDX].text);

      expect(res).to.have.property('_id');
      done();
    });
  });

  it('messages.read() reads a single message created by messages.create() ' +
     'using the _id property returned by the latter.',function(done){
    const MESSAGE_IDX = 0;
       messages.create(validMessages[MESSAGE_IDX],function(err,res){
         expect(res).to.be.an('object');
         expect(res).to.have.property('_id');
         messages.read(res._id,function(err,res){
           expect(err).to.be.null;

           expect(res).to.have.property('username');
           expect(res.username).to.equal(validMessages[MESSAGE_IDX].username);

           expect(res).to.have.property('text');
           expect(res.text).to.equal(validMessages[MESSAGE_IDX].text);

           done();
         });
       });
   });

  /* 1.3 Remaining CRUD functions */
  /*
  it('messages.readUsername() reads all messages created by messages.create()' +
     ' by the user with specified username.', function(done){
       const READ_USER_IDX = 0;
       const UNREAD_USER_IDX = 1;
       messages.create(validMessages[READ_USER_IDX],function(){
         messages.create(validMessages[UNREAD_USER_IDX],function(){
           messages.readUsername(validMessages[READ_USER_IDX].username,
           function(err,res){
             expect(err).to.be.null;

             expect(res).to.be.an('array');
             expect(res.length).to.equal(1);

             expect(res[0].username).to.equal(
               validMessages[READ_USER_IDX].username);
             expect(res[0].text).to.equal(
               validMessages[READ_USER_IDX].text);

             done();
           });
         });
       });
   });

  it('messages.readAll() reads all messages created by messages.create()',
     function(done){
       const MESSAGE_1_IDX = 0;
       const MESSAGE_2_IDX = 1;
       messages.create(validMessages[MESSAGE_1_IDX],function(){
         messages.create(validMessages[MESSAGE_2_IDX],function(){
           messages.readAll(function(err,res){
             expect(err).to.be.null;

             expect(res).to.be.an('array');
             expect(res.length).to.equal(2);

             const expectedNames = [validMessages[MESSAGE_1_IDX].username,
                                    validMessages[MESSAGE_2_IDX].username];
             const expectedTexts=  [validMessages[MESSAGE_1_IDX].text,
                                    validMessages[MESSAGE_2_IDX].text];
             const names = res.map((m)=>m.username);
             const texts = res.map((m)=>m.text);

             expect(names).to.have.members(expectedNames);
             expect(texts).to.have.members(expectedTexts);

             done();
           });
         });
       });
   });


  it('messages.update() updates a single message created by messages.create()' +
     ' using the _id property returned by the latter.',function(done){
    const ORIGINAL_MESSAGE_IDX = 0;
    const UPDATED_MESSAGE_IDX = 1;
    //Sanity check
    expect(validMessages[ORIGINAL_MESSAGE_IDX]).to.not.deep.equal(
      validMessages[UPDATED_MESSAGE_IDX]);
    messages.create(validMessages[ORIGINAL_MESSAGE_IDX],function(err,res){
      expect(res).to.be.an('object');
      expect(res).to.have.property('_id');
      messages.update(
        res._id,
        validMessages[UPDATED_MESSAGE_IDX],
        function(err,res){
          expect(err).to.be.null;
          expect(res).to.be.an('object');
          expect(res).to.have.property('_id');
          messages.read(res._id,function(err,res){
            expect(err).to.be.null;

            expect(res.username).to.equal(
              validMessages[UPDATED_MESSAGE_IDX].username);

            expect(res.text).to.equal(
              validMessages[UPDATED_MESSAGE_IDX].text);

            done();
          });
        });
    });
   });

  it('messages.delete() deletes a single message created by messages.create()' +
     ' using the _id property returned by the latter.',function(done){
    const MESSAGE_IDX = 0;
    messages.create(validMessages[MESSAGE_IDX],function(err,res){
      expect(res).to.be.an('object');
      expect(res).to.have.property('_id');
      messages.delete(res._id,function(err){
          expect(err).to.be.null;
          messages.read(res._id,function(err,res){
            expect(err).to.be.null;
            expect(res).to.be.null;
            done();
          });
        });
    });
  });

  it('messages.deleteAll() deletes all messages created by messages.create()',
     function(done){
       const MESSAGE_1_IDX = 0;
       const MESSAGE_2_IDX = 1;
       messages.create(validMessages[MESSAGE_1_IDX],function(){
         messages.create(validMessages[MESSAGE_2_IDX],function(){
           messages.deleteAll(testEmpty(done));
         });
       });
   });
  */

  /* 1.4 Data validation */
  /*
  it('messages.create() fails to create messages given data which is missing ' +
     'username and/or text properties.',function(done){
    var emptyMessage = {};
    var usernameMessage = {username:'Carol'};
    var textMessage = {text:'Carol\'s Message'};
    var testCreateFail = function(message){
        return function(done){
          messages.create(message,function(err,res){
            expect(err).to.not.be.null;
            expect(res).to.not.be.an('object');
            done();
          });
        };
    };
    async.parallel([
        testCreateFail(emptyMessage),
        testCreateFail(usernameMessage),
        testCreateFail(textMessage)
    ],testEmpty(done));
  });

  it('messages.create() fails to create messages given username and/or text ' +
     'properties which are not convertible to string.',function(done){
    var usernameMessage = {username:{prop:'val'},text:'Carol\'s Message'};
    var textMessage = {username:'Carol',text:{prop:'val'}};
    var testCreateFail = function(message){
        return function(done){
          messages.create(message,function(err,res){
            expect(err).to.not.be.null;
            expect(res).to.not.be.an('object');
            done();
          });
        };
    };
    async.series([
        testCreateFail(usernameMessage),
        testCreateFail(textMessage)
    ],testEmpty(done)
    );
  });

  it('messages.create() fails given data with more properties than username ' +
     'and text',function(done){
    var newMessage = {username:'Carol',text:'Carol\'s Message',moreData:true};
    messages.create(newMessage,function(err,res){
      expect(err).to.not.be.null;
      expect(res).to.not.be.an('object');
      done();
      });
  });

  it('messages.read() returns a null result given a non-existent ID',
     function(done){
    const MESSAGE_IDX = 0;
    messages.create(validMessages[MESSAGE_IDX],function(){
      const fakeId = '000000000000000000000000';
      messages.read(fakeId,function(err,res){
        expect(err).to.be.null;
        expect(res).to.be.null;
        done();
      });
    });
  });
  */

  /* 1.5 Security */
  /*
  it('messages passed to messages.create() are sanitized to remove dangerous ' +
     'HTML before being stored',function(done){
    const dangerousHTML = '<script>maliciousCode()</script>';
    const MESSAGE_IDX = 0;
    var usernameMessage = {
      username:validMessages[MESSAGE_IDX].username + dangerousHTML,
      text:validMessages[MESSAGE_IDX].text
    };
    var textMessage = {
      username:validMessages[MESSAGE_IDX].username,
      text:validMessages[MESSAGE_IDX].text + dangerousHTML
    };
    var testCreateSanitized = function(message){
        return function(done){
          messages.create(message,function(err,res){
            expect(err).to.be.null;
            expect(res).to.be.an('object');
            expect(res).to.have.property('_id');
            messages.read(res._id,function(err,res){
              expect(err).to.be.null;

              expect(res.username).to.equal(
                validMessages[MESSAGE_IDX].username);

              expect(res.text).to.equal(
                validMessages[MESSAGE_IDX].text);

              done();
            });
          });
        };
    };
    async.parallel([
        testCreateSanitized(usernameMessage),
        testCreateSanitized(textMessage)
    ],done);
  });

  it('messages.read() fails if given data which is not convertible to an '+
     'ID',function(done){
    const MESSAGE_IDX = 0;
    messages.create(validMessages[MESSAGE_IDX],function(){
      const invalidId = {$ne:''};
      messages.read(invalidId,function(err,res){
        expect(err).to.not.be.null;
        expect(res).to.not.be.an('object');
        done();
      });
    });
  });

  it('messages.readUsername() fails if given data which is not convertible to '+
     'string',function(done){
      const MESSAGE_IDX = 0;
      messages.create(validMessages[MESSAGE_IDX],function(){
        var injectionUsername = {$ne:''};
        messages.readUsername(injectionUsername,function(err,res){
          expect(err).to.not.be.null;
          expect(res).to.not.be.an('array');
          done();
        });
      });
  });
  */
});
