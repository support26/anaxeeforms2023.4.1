const { testService, withClosedForm } = require('../setup');
const testData = require('../../data/xml');

const collector = (f) => (service) =>
  service.login('chelsea', (asChelsea) =>
    asChelsea.get('/v1/users/current')
      .expect(200)
      .then(({ body }) => body)
      .then((chelsea) => service.login('alice', (asAlice) =>
        asAlice.post(`/v1/projects/1/assignments/formfill/${chelsea.id}`)
          .expect(200)
          .then(() => f(asChelsea, chelsea, service)))));

describe('data collector role', () => {
  it('should be able to list projects it can access', testService((service) =>
    service.login('alice', (asAlice) =>
      asAlice.post('/v1/projects')
        .send({ name: 'Project Two' })
        .expect(200)
        .then(() => service)
        .then(collector((asCollector) => asCollector.get('/v1/projects')
          .expect(200)
          .then(({ body }) => {
            body.length.should.equal(1);
            body[0].should.be.a.Project();
            body[0].name.should.equal('Default Project');
          }))))));

  it('should be able to get basic project details', testService(collector((asCollector) =>
    asCollector.get('/v1/projects/1')
      .expect(200)
      .then(({ body }) => { body.should.be.a.Project(); }))));

  it('should not be able to update project details', testService(collector((asCollector) =>
    asCollector.patch('/v1/projects/1')
      .send({ name: 'New Name' })
      .expect(403))));

  it('should be able to list all forms in a project', testService(collector((asCollector) =>
    asCollector.get('/v1/projects/1/forms?publish=true')
      .expect(200)
      .then(({ body }) => {
        body.length.should.equal(2);
        body.forEach((form) => form.should.be.a.Form());
        body[0].xmlFormId.should.equal('simple');
        body[1].xmlFormId.should.equal('withrepeat');
      }))));

  it('should be able to get form detail', testService(collector((asCollector) =>
    asCollector.get('/v1/projects/1/forms/simple')
      .expect(200)
      .then(({ body }) => { body.should.be.a.Form(); }))));

  it('should not be able to update form details', testService(collector((asCollector) =>
    asCollector.patch('/v1/projects/1/forms/simple')
      .send({ name: 'New Name' })
      .expect(403))));

  it('should not be able to create new forms', testService(collector((asCollector) =>
    asCollector.post('/v1/projects/1/forms')
      .send(testData.forms.withAttachments)
      .set('Content-Type', 'text/xml')
      .expect(403))));

  it('should not be able to list form submissions', testService(collector((asCollector) =>
    asCollector.get('/v1/projects/1/forms/simple/submissions')
      .expect(403))));

  it('should be able to create new submissions', testService(collector((asCollector) =>
    asCollector.post('/v1/projects/1/forms/simple/submissions')
      .send(testData.instances.simple.one)
      .set('Content-Type', 'text/xml')
      .expect(200))));

  it('should not be able to download submissions', testService(collector((asCollector) =>
    asCollector.get('/v1/projects/1/forms/simple/submissions.csv.zip')
      .expect(403))));

  it('should not be able to get submission detail', testService(collector((asCollector) =>
    asCollector.get('/v1/projects/1/forms/simple/submissions/one')
      .expect(403))));

  it('should not be able access closed forms and its sub-resources', testService(withClosedForm(collector(async (asCollector) => {

    await asCollector.get('/v1/projects/1/forms')
      .expect(200)
      .then(({ body }) => {
        body.length.should.equal(2);
        body.forEach((form) => form.should.be.a.Form());
        body[0].xmlFormId.should.equal('simple');
        body[1].xmlFormId.should.equal('withrepeat');
      });

    await asCollector.get('/v1/projects/1/forms/withAttachments')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/simple2.xls')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/withAttachments.xml')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/withAttachments/versions')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/withAttachments/fields')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/withAttachments/manifest')
      .set('X-OpenRosa-Version', '1.0')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/withAttachments/attachments')
      .expect(403);

    await asCollector.get('/v1/projects/1/forms/withAttachments/attachments/goodone.csv')
      .expect(403);

  }))));

  it('should be able see closing forms and make submission', testService(collector(async (asCollector, _, service) => {

    const asAlice = await service.login('alice');

    await asAlice.patch('/v1/projects/1/forms/simple')
      .send({ state: 'closing' })
      .expect(200);

    await asCollector.get('/v1/projects/1/forms?publish=true')
      .expect(200)
      .then(({ body }) => {
        body.length.should.equal(2);
        body.forEach((form) => form.should.be.a.Form());
        body[0].xmlFormId.should.equal('simple');
        body[1].xmlFormId.should.equal('withrepeat');
      });

    await asCollector.get('/v1/projects/1/forms/simple')
      .expect(200);

    await asCollector.post('/v1/projects/1/forms/simple/submissions')
      .send(testData.instances.simple.one)
      .set('Content-Type', 'text/xml')
      .expect(200);

    // Let's close the Form
    await asAlice.patch('/v1/projects/1/forms/simple')
      .send({ state: 'closed' })
      .expect(200);

    // Should not be able make Submission
    await asCollector.post('/v1/projects/1/forms/simple/submissions')
      .send(testData.instances.simple.two)
      .set('Content-Type', 'text/xml')
      .expect(409);

  })));

});

