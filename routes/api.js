'use strict';

const { v4: uuidv4 } = require('uuid');

// In-memory storage for issues
let projects = {};

module.exports = function (app) {

	app.route('/api/issues/:project')

		.get(function (req, res) {
			const project = req.params.project;
			const queryParams = req.query;

			// Retrieve issues for the project
			let issues = projects[project] || [];

			// Filter by query parameters if provided
			if (Object.keys(queryParams).length > 0) {
				issues = issues.filter(issue => {
					for (let key in queryParams) {
						if (queryParams[key] !== String(issue[key])) {
							return false;
						}
					}
					return true;
				});
			}

			res.json(issues);
		})

		.post(function (req, res) {
			const project = req.params.project;
			const {
				issue_title,
				issue_text,
				created_by,
				assigned_to = '',
				status_text = ''
			} = req.body;

			// Check required fields
			if (!issue_title || !issue_text || !created_by) {
				res.json({ error: 'required field(s) missing' });
				return;
			}

			// Create issue object
			const newIssue = {
				_id: uuidv4(),
				issue_title,
				issue_text,
				created_by,
				assigned_to,
				status_text,
				created_on: new Date().toISOString(),
				updated_on: new Date().toISOString(),
				open: true
			};

			// Initialize project issues array if it doesn't exist
			if (!projects[project]) {
				projects[project] = [];
			}

			// Add new issue to the project
			projects[project].push(newIssue);

			res.json(newIssue);
		})

		.put(function (req, res) {
			const project = req.params.project;
			const {
				_id,
				issue_title,
				issue_text,
				created_by,
				assigned_to,
				status_text,
				open
			} = req.body;

			// Check for _id
			if (!_id) {
				res.json({ error: 'missing _id' });
				return;
			}

			// Check if any update fields are provided
			if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
				res.json({ error: 'no update field(s) sent', '_id': _id });
				return;
			};


			// Find the issue by _id
			try {
				const issueToUpdate = (projects[project] || []).find(issue => issue._id === _id);

				if (!issueToUpdate) {
					throw new Error("project not found");
				}

				// Update issue fields if provided
				if (issue_title) {
					issueToUpdate.issue_title = issue_title;
				}
				if (issue_text) {
					issueToUpdate.issue_text = issue_text;
				}
				if (created_by) {
					issueToUpdate.created_by = created_by;
				}
				if (assigned_to !== undefined) {
					issueToUpdate.assigned_to = assigned_to;
				}
				if (status_text !== undefined) {
					issueToUpdate.status_text = status_text;
				}
				if (open !== undefined) {
					issueToUpdate.open = open === true || open === 'true';
				}
				// Update updated_on timestamp
				issueToUpdate.updated_on = new Date().toISOString();

				res.json({ result: 'successfully updated', '_id': _id });
			} catch (err) {
				res.json({ error: "could not update", _id: _id });
			}

		})

		.delete(function (req, res) {
			const project = req.params.project;
			const { _id } = req.body;

			// Check for _id
			if (!_id) {
				res.json({ error: 'missing _id' });
				return;
			}

			// Find index of issue to delete
			const index = (projects[project] || []).findIndex(issue => issue._id === _id);

			if (index === -1) {
				res.json({ error: 'could not delete', '_id': _id });
				return;
			}

			// Remove issue from array
			projects[project].splice(index, 1);

			res.json({ result: 'successfully deleted', '_id': _id });
		});

};
