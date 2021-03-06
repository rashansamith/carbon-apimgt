/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import qs from 'qs';
import PropTypes from 'prop-types';

import Alert from '../../Shared/Alert';
import PageNavigation from '../APIsNavigation';
import PageContainer from '../../Base/container/';
import API from '../../../data/api.js';
import { Progress } from '../../Shared';
import ResourceNotFound from '../../Base/Errors/ResourceNotFound';
import SampleAPI from './SampleAPI/SampleAPI';
import CardView from './CardView/CardView';
// import TableView from './TableView/TableView';
import TopMenu from './components/TopMenu';

/**
 * Render the APIs Listing page, This is the Default Publisher Landing page as well
 *
 * @class Listing
 * @extends {React.Component}
 */
class Listing extends React.Component {
    /**
     *Creates an instance of Listing.
     * @param {*} props
     * @memberof Listing
     */
    constructor(props) {
        super(props);
        this.state = { isCardView: true, apis: null };
        this.handleApiDelete = this.handleApiDelete.bind(this);
        this.updateApi = this.updateApi.bind(this);
        this.toggleView = this.toggleView.bind(this);
    }

    /**
     *
     * @inheritdoc
     * @memberof Listing
     */
    componentDidMount() {
        const promisedApis = API.all();
        promisedApis
            .then((response) => {
                this.setState({ apis: response.obj });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') console.log(error);
                const { status } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 401) {
                    const params = qs.stringify({ reference: this.props.location.pathname });
                    this.props.history.push({ pathname: '/login', search: params });
                }
            });
    }

    /**
     *
     *
     * @memberof Listing
     */
    toggleView() {
        this.setState({ isCardView: !this.state.isCardView });
    }

    /**
     * Update Sample API
     *
     * @param {String} apiUUID
     * @memberof Listing
     */
    updateApi(apiUUID) {
        const api = this.state.apis;
        for (const apiIndex in api.list) {
            if (api.list.apiIndex && api.list[apiIndex].id === apiUUID) {
                api.list.splice(apiIndex, 1);
                break;
            }
        }
        this.setState({ apis: api });
    }

    /**
     *
     * Delete an API listed in the listing page
     * @param {String} apiUUID API UUID
     * @param {String} [name=''] API Name use for alerting purpose only
     * @memberof Listing
     */
    handleApiDelete(event) {
        const apiUUID = event.currentTarget.id;
        const { apis } = this.state;
        Alert.info('Deleting the API ...');
        const apiObj = new API();
        const promisedDelete = apiObj.deleteAPI(apiUUID);
        promisedDelete.then((response) => {
            if (response.status !== 200) {
                console.log(response);
                Alert.info('Something went wrong while deleting the API!');
                return;
            }
            Alert.info('API deleted Successfully');
            for (const apiIndex in apis.list) {
                if (apis.list[apiIndex].id === apiUUID) {
                    apis.list.splice(apiIndex, 1);
                    break;
                }
            }
            this.setState({ apis });
        });
    }

    /**
     *
     * @inheritdoc
     * @returns {React.Component} @inheritdoc
     * @memberof Listing
     */
    render() {
        const { apis, notFound, isCardView } = this.state;
        if (notFound) {
            return (
                <PageContainer pageNav={<PageNavigation />}>
                    <ResourceNotFound />
                </PageContainer>
            );
        }
        if (!apis) {
            return (
                <PageContainer pageNav={<PageNavigation />}>
                    <Progress />
                </PageContainer>
            );
        }
        if (apis.count === 0) {
            return (
                <PageContainer pageNav={<PageNavigation />}>
                    <SampleAPI />
                </PageContainer>
            );
        }

        return (
            <PageContainer
                pageTopMenu={<TopMenu toggleView={this.toggleView} isCardView={isCardView} />}
                pageNav={<PageNavigation />}
            >
                {isCardView ? <CardView handleApiDelete={this.handleApiDelete} apis={apis} /> : 'Table view here'}
            </PageContainer>
        );
    }
}

Listing.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,
};

export default Listing;
