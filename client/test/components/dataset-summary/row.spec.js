import { RouterLinkStub } from '@vue/test-utils';
import Row from '../../../src/components/dataset/summary/row.vue';
import Property from '../../util/ds-property-enum';

import testData from '../../data';
import { mount } from '../../util/lifecycle';
import { mockRouter } from '../../util/router';

describe('Dataset summary row', () => {
  const theories = [
    { case: 'Case 1', isNew: true, properties: [Property.NewProperty] },
    { case: 'Case 2', isNew: false, properties: [Property.DefaultProperty] },
    { case: 'Case 3', isNew: false, properties: [Property.NewProperty, Property.InFormProperty, Property.DefaultProperty] }
  ];

  theories.forEach(data => {
    it(`renders dataset summary row correctly for ${data.case}`, async () => {
      const { case: _, ...options } = data;
      const dataset = testData.formDraftDatasetDiffs.createPast(1, options).last();
      const inFormProperties = dataset.properties.filter(p => p.inForm);
      const component = mount(Row, {
        props: { dataset, projectId: 1 },
        container: {
          router: mockRouter('/')
        }
      });
      component.get('.dataset-name').text().should.be.equal(dataset.name);
      if (data.isNew)
        component.find('.dataset-name a').exists().should.be.false();
      else
        component.getComponent(RouterLinkStub).props().to.should.be.equal(`/projects/1/entity-lists/${dataset.name}`);
      component.find('.dataset-new').exists().should.be.equal(data.isNew);
      component.get('.properties-count').text().should.be.equal(`${inFormProperties.length} of ${dataset.properties.length} ${dataset.properties.length === 1 ? 'property' : 'properties'}`);

      // check name of the properties is hidden
      component.get('.property-list').should.be.hidden();
      // let expand properties
      await component.get('.expand-button').trigger('click');
      // check properties are not visible
      component.get('.property-list').should.be.visible();

      component.findAll('.property-list > div > span').forEach((p, i) => {
        // verify name of the properties
        p.text().replace(',', '').should.be.equal(inFormProperties[i].name);
        // check if there's plus icon for new properties
        p.find('.icon-plus-circle').exists().should.be.equal(inFormProperties[i].isNew);
      });
    });
  });

  it('should show help text when there is no properties', async () => {
    const dataset = testData.formDraftDatasetDiffs.createPast(1, { isNew: false, properties: [] }).last();
    const component = mount(Row, {
      props: { dataset, projectId: 1 },
      container: {
        router: mockRouter('/')
      }
    });
    component.getComponent(RouterLinkStub).props().to.should.be.equal(`/projects/1/entity-lists/${dataset.name}`);
    component.get('.properties-count').text().should.be.equal('0 of 0 properties');

    // check help text is hidden (.property-list is the parent)
    component.get('.property-list').should.be.hidden();
    // let expand help text
    await component.get('.expand-button').trigger('click');
    // check help text is visible
    component.get('.property-list').should.be.visible();
    // verify text
    component.find('.no-properties').text().should.be.equal('This Form only sets the “label”.');
  });
});
