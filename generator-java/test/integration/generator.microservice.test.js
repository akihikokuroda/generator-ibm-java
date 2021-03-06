/*
 * Copyright IBM Corporation 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tests the microservice generator
 */

'use strict';

const testAsserts = require('../../index').testAsserts;
const AssertMicroservice = testAsserts.starters.microservice;
const constant = testAsserts.constant;
const framework = testAsserts.framework;
const core = require('../lib/core');
const assert = require('yeoman-assert');
const extend = require('extend');

class Options extends core.Options {
  constructor(runHeadless, buildType, frameworkType, javaMetrics) {
    super(frameworkType === 'spring' ? 'SPRING' : 'JAVA');
    extend(this.values, {
      headless: runHeadless.toString(),
      buildType: buildType,
      frameworkType: frameworkType || constant.FRAMEWORK_LIBERTY,
      createType: 'microservice/' + (frameworkType || constant.FRAMEWORK_LIBERTY),
      appName: constant.APPNAME,
      javametrics: javaMetrics
    });
  }
}

const gradle = 'gradle';
const maven = 'maven';
const assertMicroservice = new AssertMicroservice();

execute(constant.FRAMEWORK_LIBERTY);
execute(constant.FRAMEWORK_SPRING);

function execute(framework) {
  const name = framework.toUpperCase();
  const backendPlatform = framework === 'liberty' ? 'JAVA' : 'SPRING';

  describe('java generator : microservice integration test', function () {
    this.timeout(7000);

    // execute each of these tests for both Liberty and Spring frameworks
    describe(name + ': Generates a basic microservices project (no bluemix), gradle build with prompts', function () {
      const options = new Options(false, gradle, framework);
      options.prompts = { extName: 'prompt:patterns', buildType: gradle, createType: 'microservice/' + framework, services: ['none'], appName: constant.APPNAME, artifactId: constant.ARTIFACTID };
      before(options.before.bind(options));
      assertMicroservice.assert(options.values.appName, options.values.appName, gradle, framework, options.values.createType, false, false);
      it('should create a basic microservice, gradle build system', function () {
        assert.fileContent('README.md', gradle);
        assert.noFileContent('README.md', maven);
      });
    });

    describe(name + ': Generates a basic microservices project (no bluemix), maven build with prompts', function () {
      const options = new Options(false, maven, framework);
      options.prompts = { extName: 'prompt:patterns', buildType: maven, createType: 'microservice/' + framework, services: ['none'], appName: constant.APPNAME, artifactId: constant.ARTIFACTID };
      before(options.before.bind(options));
      assertMicroservice.assert(options.values.appName, options.values.appName, maven, framework, options.values.createType, false, false);
      it('should create a basic microservice, maven build system', function () {
        assert.fileContent('README.md', maven);
        assert.noFileContent('README.md', gradle);
      });
    });

    describe(name + ': Generates a basic microservices project (no bluemix), gradle build system', function () {
      const options = new Options(true, gradle, framework);
      before(options.before.bind(options));
      assertMicroservice.assert(options.values.appName, options.values.appName, gradle, framework, options.values.createType, false, false);
      it('should create a basic microservice, gradle build system', function () {
        assert.fileContent('README.md', gradle);
        assert.noFileContent('README.md', maven);
      });
    });

    describe(name + ': Generates a basic microservices project (no bluemix), maven build system', function () {
      const options = new Options(true, maven, framework);
      before(options.before.bind(options));
      assertMicroservice.assert(options.values.appName, options.values.appName, maven, framework, options.values.createType, false, false);
      it('should create a basic microservice, maven build system', function () {
        assert.fileContent('README.md', maven);
        assert.noFileContent('README.md', gradle);
      });
    });

    describe(name + ': Generates a basic microservices project (gradle, bluemix, no services)', function () {
      const options = new Options(true, gradle, framework);
      options.values.bluemix.name = 'bxName';
      before(options.before.bind(options));
      assertMicroservice.assert('bxName', 'bxName', gradle, framework, options.values.createType, false, false);
      it('with no services', function () {
        assert.fileContent('manifest.yml', 'name: bxName') // Not using prompt so we get app name and random route
        assert.fileContent('manifest.yml', 'random-route: true') // Not using prompt so we get app name and random route
      });
    });

    describe(name + ': Generates a basic microservices project (maven, bluemix, cloudant)', function () {
      const options = new Options(true, maven, framework);
      options.values.bluemix = '{"name" : "bxName", "backendPlatform" : "' + backendPlatform + '", "server" : {"host": "host", "domain": "mybluemix.net", "services" : ["cloudant"]}, "cloudant" : [{"serviceInfo": {"name": "test-cloudantNoSQLDB-000","label": "cloudantNoSQLDB","plan": "Lite"},"password" : "pass", "url" : "https://account.cloudant.com", "username" : "user"}]}';
      before(options.before.bind(options));
      assertMicroservice.assert('bxName', 'bxName', maven, framework, options.values.createType, true, false);
    });

    describe(name + ': Generates a basic microservices project (gradle, bluemix, cloudant)', function () {
      const options = new Options(true, gradle, framework);
      options.values.bluemix = '{"name" : "bxName", "backendPlatform" : "' + backendPlatform + '", "server" : {"host": "host", "domain": "mybluemix.net", "services" : ["cloudant"]}, "cloudant" : [{"serviceInfo": {"name": "test-cloudantNoSQLDB-000","label": "cloudantNoSQLDB","plan": "Lite"},"password" : "pass", "url" : "https://account.cloudant.com", "username" : "user"}]}';
      before(options.before.bind(options));
      assertMicroservice.assert('bxName', 'bxName', gradle, framework, options.values.createType, true, false);
    });

    describe(name + ': Generates a basic microservices project (maven, bluemix, objectStorage)', function () {
      const options = new Options(true, maven, framework);
      options.values.bluemix = '{"name" : "bxName", "backendPlatform" : "' + backendPlatform + '", "server" : {"host": "host", "domain": "mybluemix.net", "services" : ["objectStorage"]}, "objectStorage" : [{"serviceInfo": {"name": "test-Object-Storage-000","label": "Object-Storage","plan": "standard"},"project": "objectStorage-project", "userId": "objectStorage-userId", "password": "objectStorage-password","auth_url": "objectStorage-url","domainName": "objectStorage-domainName"}]}';
      before(options.before.bind(options));
      assertMicroservice.assert('bxName', 'bxName', maven, framework, options.values.createType, false, true);
    });

    describe(name + ': Generates a basic microservices project (gradle, bluemix, objectStorage)', function () {
      const options = new Options(true, gradle, framework);
      options.values.bluemix = '{"name" : "bxName", "backendPlatform" : "' + backendPlatform + '", "server" : {"host": "host", "domain": "mybluemix.net", "services" : ["objectStorage"]}, "objectStorage" : [{"serviceInfo": {"name": "test-Object-Storage-000","label": "Object-Storage","plan": "standard"},"project": "objectStorage-project", "userId": "objectStorage-userId", "password": "objectStorage-password","auth_url": "objectStorage-url","domainName": "objectStorage-domainName"}]}';
      before(options.before.bind(options));
      assertMicroservice.assert('bxName', 'bxName', gradle, framework, options.values.createType, false, true);
    });
  });
}

describe('Basic microservices project checking javametrics', function () {
  describe('Generate a basic liberty microservices project checking javametrics exists', function () {
    const options = new Options(true, maven, constant.FRAMEWORK_LIBERTY, true);
    before(options.before.bind(options));
    framework.test(constant.FRAMEWORK_LIBERTY).assertJavaMetrics(true, maven);
    it('Check dockerfile contains javametrics options', function () {
      assert.fileContent('Dockerfile', 'COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
      assert.fileContent('Dockerfile', 'COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
    });
  });

  describe('Generate a basic liberty microservices project checking javametrics does not exist', function () {
    const options = new Options(true, maven, constant.FRAMEWORK_LIBERTY);
    before(options.before.bind(options));
    framework.test(constant.FRAMEWORK_LIBERTY).assertJavaMetrics(false, maven);
    it('Check dockerfile does not contain javametrics options', function () {
      assert.noFileContent('Dockerfile', 'COPY /target/liberty/wlp/usr/shared/resources /config/resources/');
      assert.noFileContent('Dockerfile', 'COPY /src/main/liberty/config/jvmbx.options /config/jvm.options');
    });
  });
});
