import { NextPage } from 'next';
import { withApollo } from '../../components/withApollo';
import HomePage from '../index'
export default withApollo(HomePage as NextPage);