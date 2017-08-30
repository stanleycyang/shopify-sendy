'use strict';

require('dotenv').config();
const shopifyAPI = require('shopify-node-api');
const request = require('request');

const Shopify = new shopifyAPI({
  shop: process.env.SHOP,
  shopify_api_key: process.env.SHOPIFY_API_KEY,
  access_token: process.env.ACCESS_TOKEN,
});

Shopify.get('/admin/customers.json', {}, function(err, data, headers){

  const promises = data.customers.map((customer, index) => {
    const name = `${customer.first_name} ${customer.last_name}`;
    const email = customer.email;
    const boolean = true;

    console.log('name', name);
    console.log('email', email);

    if ((customer.orders_count > 0) && customer.first_name && customer.last_name) {
      // if they are a customer
      return new Promise((resolve, reject) => {
        return request.post({
          url: 'https://noreply.testimon.io/subscribe',
          credentials: 'include',
          form: {
            email,
            name,
            list: process.env.BUYER_LIST,
            boolean,
          },
        }, (err, response, body) => {
          if (err) {
            return reject(err);
          }

          resolve(body);
        });
      });
    } else {
      // if they are a subscriber
      return new Promise((resolve, reject) => {
        return request.post({
          url: 'https://noreply.testimon.io/subscribe',
          credentials: 'include',
          form: {
            email,
            list: process.env.SUBSCRIBER_LIST,
            boolean,
          },
        }, (err, response, body) => {
          if (err) {
            return reject(err);
          }

          resolve(body);
        });
      });
    }


  });

  return Promise.all(promises).then(result => {
    console.log(result);
  }).catch(err => {
    console.error(err);
  });

});
