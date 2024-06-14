const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let projectId;

  // Test: Create an issue with every field
  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue with every field',
        created_by: 'John Doe',
        assigned_to: 'Jane Smith',
        status_text: 'In Progress'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, '_id');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        projectId = res.body._id; // Save _id for later use
        done();
      });
  });

  // Test: Create an issue with only required fields
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Minimal Issue',
        issue_text: 'This is a minimal test issue',
        created_by: 'John Doe'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, '_id');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        done();
      });
  });

  // Test: Create an issue with missing required fields
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Incomplete Issue'
        // Missing created_by field intentionally
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // Test: View issues on a project
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test: View issues on a project with one filter
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        // Assuming issues returned are all open, based on test setup
        done();
      });
  });

  // Test: View issues on a project with multiple filters
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true, assigned_to: 'Jane Smith' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        // Assuming issues returned match both filters, based on test setup
        done();
      });
  });

  // Test: Update one field on an issue
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: projectId,
        issue_title: 'Updated Issue Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test: Update multiple fields on an issue
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: projectId,
        issue_text: 'Updated issue text',
        assigned_to: 'John Doe',
        status_text: 'In Review',
        open: false
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test: Update an issue with missing _id
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        issue_title: 'Updated Title'
        // Missing _id intentionally
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test: Update an issue with no fields to update
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: projectId
        // No other fields provided intentionally
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test: Update an issue with an invalid _id
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: 'invalid-id',
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not update');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test: Delete an issue
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: projectId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully deleted');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test: Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: 'invalid-id'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not delete');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test: Delete an issue with missing _id
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});

