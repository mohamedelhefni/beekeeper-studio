// ORIGINAL COPYRIGHT FOR THIS FILE CAN BE FOUND IN THE LICENSE FILE IN THIS FOLDER
/* eslint-disable */
const Promise = require('bluebird');
const Client = require('knex/lib/client');

const SchemaCompiler = require('./schema/compiler').default
const QueryCompiler = require('./query/querycompiler').default
const ColumnCompiler = require('./schema/columncompiler').default
const TableCompiler = require('./schema/tablecompiler').default
/* eslint-enable */


class BigQueryClient extends Client {
  constructor(config) {
    super(config);
  }

  schemaCompiler() {
    return new SchemaCompiler(this, ...arguments);
  }

  queryCompiler(builder, formatter) {
    return new QueryCompiler(this, builder, formatter);
  }

  columnCompiler() {
    return new ColumnCompiler(this, ...arguments);
  }

  tableCompiler() {
    return new TableCompiler(this, ...arguments);
  }

  get dialect() {
    return 'bigquery';
  }

  get driverName() {
    return 'bigquery';
  }

  get canCancelQuery() {
    return true;
  }

  _driver() {
    // eslint-disable-next-line
    const { BigQuery, BigQueryDate } = require('@google-cloud/bigquery');
    this.bigQueryTypes = {
      date: BigQueryDate
    };
    return new BigQuery(this.connectionSettings);
  }

  acquireRawConnection() {
    return Promise.resolve({
      driver: this.driver,
      job: null
    });
  }

  validateConnection() {
    return Promise.resolve(true);
  }

  destroyRawConnection(connection) {
    return this.cancelJob(connection);
  }

  wrapIdentifier(value) {
    return value !== '*' ? `\`${value}\`` : '*';
  }

  cancelJob(connection) {
    if (connection.job === null) {
      return Promise.resolve();
    }
    const cancelJobRequest = connection.job.cancel();
    connection.job = null;
    return cancelJobRequest;
  }

  _query(connection, obj) {
    const queryConfig = {
      ...obj.options,
      query: obj.sql,
      params: obj.bindings
    };
  
    return this.createJob(connection, queryConfig)
      .then(connection => this.getJobResults(connection, obj))
      .catch(err => {
        this.cancelJob(connection);
        throw err;
      });
  }

  createJob(connection, queryConfig) {
    return Promise.resolve(
      connection.driver
        .createQueryJob(queryConfig)
        .then(res => {
          connection.job = res[0];
          return connection;
        })
    );
  }

  getJobResults(connection, obj) {
    return connection.job
      .getQueryResults({ autoPaginate: false })
      .then(res => {
        obj.response = res[0];
        connection.job = null;
        return obj;
      });
  }

  processResponse(obj) {
    for (const row of obj.response) {
      for (const key of Object.keys(row)) {
        if (row[key] !== null) {
          row[key] = this.formatResponseValue(row[key]);
        }
      }
    }
    return obj.response;
  }

  formatResponseValue(value) {
    switch (value.constructor) {
      case this.bigQueryTypes.date:
        return new Date(value.value);
      default:
        return value;
    }
  }
}

module.exports = { BigQueryClient };
