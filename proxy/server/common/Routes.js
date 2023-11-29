const ROUTES = [
    {
        url: '/api/products',
        proxy: {
            target: "http://localhost:80",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/products`]: '/productos',
            },
        }
    },
    {
        url: '/api/orders',
        proxy: {
            target: "http://localhost:83",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/orders`]: '/ordenes',
            },
        }
    },
    {
        url: '/api/suppliers',
        proxy: {
            target: "http://localhost:82",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/suppliers`]: '/api/v1/proveedores',
            },
        }
    },
    {
        url: '/api/suppierContracts',
        proxy: {
            target: "http://localhost:82",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/suppierContracts`]: '/api/v1/contratos',
            },
        }
    },
    {
        url: '/api/shippings',
        proxy: {
            target: "http://localhost:84",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/shippings`]: '/envios',
            },
        }
    },
    {
        url: '/api/payments',
        proxy: {
            target: "http://localhost:85",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/payments`]: '/pagos',
            },
        }
    },
    {
        url: '/api/auth',
        proxy: {
            target: "http://localhost:90",
            changeOrigin: true,
            pathRewrite: {
                [`^/api/auth`]: '/auth',
            },
        }
    }
];

export default ROUTES;