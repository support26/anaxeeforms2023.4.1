import { RouterLinkStub } from '@vue/test-utils';

import FormOverviewRightNow from '../../../../src/components/form/overview/right-now.vue';
import FormVersionString from '../../../../src/components/form-version/string.vue';
import FormVersionViewXml from '../../../../src/components/form-version/view-xml.vue';
import SummaryItem from '../../../../src/components/summary-item.vue';
import testData from '../../../data';
import useForm from '../../../../src/request-data/form';

import { load } from '../../../util/http';
import { mockLogin } from '../../../util/session';
import { mockRouter } from '../../../util/router';
import { mount } from '../../../util/lifecycle';
import { testRequestData } from '../../../util/request-data';

const mountComponent = () => {
  const form = testData.extendedForms.last();
  const publishedAttachments = testData.standardFormAttachments.sorted();
  return mount(FormOverviewRightNow, {
    container: {
      router: mockRouter(`/projects/1/forms/${encodeURIComponent(form.xmlFormId)}`),
      requestData: testRequestData([useForm], {
        form,
        publishedAttachments
      })
    }
  });
};

const findItem = (component, idSuffix) => {
  const id = `form-overview-right-now-${idSuffix}`;
  const items = component.findAllComponents(SummaryItem);
  return items.find(item => item.attributes().id === id);
};

describe('FormOverviewRightNow', () => {
  beforeEach(mockLogin);

  it('shows the version string of the primary form version', () => {
    testData.extendedForms.createPast(1);
    testData.extendedFormVersions.createPast(1, { version: 'v2', draft: true });
    const component = mountComponent();
    component.getComponent(FormVersionString).props().version.should.equal('v1');
  });

  it('toggles the "View XML" modal', () => {
    testData.extendedForms.createPast(1);
    return load('/projects/1/forms/f', { root: false }).testModalToggles({
      modal: FormVersionViewXml,
      show: '#form-overview-right-now .form-version-def-dropdown a',
      hide: '.btn-primary',
      respond: (series) => series.respondWithData(() => '<x/>')
    });
  });

  describe('form state', () => {
    it('renders correctly if the form is open', () => {
      testData.extendedForms.createPast(1, { state: 'open' });
      const item = findItem(mountComponent(), 'state');
      item.props().icon.should.equal('exchange');
      item.get('.summary-item-heading').text().should.equal('Open');
      item.get('.summary-item-body').text().should.equal('This Form is downloadable and is accepting Submissions.');
    });

    it('renders correctly if the form is closing', () => {
      testData.extendedForms.createPast(1, { state: 'closing' });
      const item = findItem(mountComponent(), 'state');
      item.props().icon.should.equal('clock-o');
      item.get('.summary-item-heading').text().should.equal('Closing');
      item.get('.summary-item-body').text().should.equal('This Form is not downloadable but still accepts Submissions.');
    });

    it('renders correctly if the form is closed', () => {
      testData.extendedForms.createPast(1, { state: 'closed' });
      const item = findItem(mountComponent(), 'state');
      item.props().icon.should.equal('ban');
      item.get('.summary-item-heading').text().should.equal('Closed');
      item.get('.summary-item-body').text().should.equal('This Form is not downloadable and does not accept Submissions.');
    });
  });

  describe('submissions', () => {
    it('shows the count', () => {
      testData.extendedForms.createPast(1, { submissions: 123 });
      const item = findItem(mountComponent(), 'submissions');
      item.get('.summary-item-heading').text().should.equal('123');
    });

    it('links to the submissions page', () => {
      testData.extendedForms.createPast(1, { xmlFormId: 'a b' });
      const item = findItem(mountComponent(), 'submissions');
      item.props().to.should.equal('/projects/1/forms/a%20b/submissions');
    });
  });

  describe('linked datasets', () => {
    it('shows the count', () => {
      testData.standardFormAttachments.createPast(1, { name: 'trees.csv', datasetExists: true });
      const item = findItem(mountComponent(), 'linked-datasets');
      item.get('.summary-item-heading').text().should.equal('1');
    });

    it('is not displayed if there is no linked datasets', () => {
      testData.standardFormAttachments.createPast(1, { name: 'trees.csv', datasetExists: false });
      const item = findItem(mountComponent(), 'linked-datasets');
      should.not.exist(item);
    });

    it('lists name of datasets', () => {
      testData.standardFormAttachments.createPast(1, { name: 'trees.csv', datasetExists: true });
      testData.standardFormAttachments.createPast(1, { name: 'people.csv', datasetExists: true });
      const item = findItem(mountComponent(), 'linked-datasets');
      const rows = item.findAll('tr');
      rows[0].text().should.be.equal('people');
      rows[0].getComponent(RouterLinkStub).props().to.should.be.equal('/projects/1/entity-lists/people');
      rows[1].text().should.be.equal('trees');
      rows[1].getComponent(RouterLinkStub).props().to.should.be.equal('/projects/1/entity-lists/trees');
    });
  });
});
