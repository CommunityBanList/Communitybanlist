import React from 'react';
import { useParams } from 'react-router-dom';

import { Card, CardBody, Container } from 'reactstrap';

import Layout from '../layout/layout.js';

import { CreateExportBanList } from '../../components';

export default function () {
  const { id } = useParams();
  return (
    <Layout>
      <section className="section section-lg pt-lg-0 mt--200">
        <Container>
          <Card className="shadow border-0">
            <CardBody className="pt-5 pb-2 border-bottom">
              <div className="icon icon-shape bg-gradient-info rounded-circle text-white mb-4">
                <i className="fa fa-angle-double-down" />
              </div>
              <h6 className="text-info text-uppercase">Export Ban Lists</h6>
              <p className="description mt-2">
                Configure and generate ban lists from our database that preemptively ban harmful
                players before they have a chance to harm your community.
              </p>
            </CardBody>
            <CreateExportBanList exportBanListID={id === 'new' ? null : parseInt(id)} />
          </Card>
        </Container>
      </section>
    </Layout>
  );
}
