const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
require('dotenv').config();

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')
const dboyRoutes = require('./routes/dboy')
const bannerRoutes = require('./routes/banner')
const brandRoutes = require('./routes/brand')
const photoRoutes = require('./routes/photo')
const packageRoutes = require('./routes/package')
const prescriptionfileRoutes = require('./routes/prescriptionfile')
const visionRoutes = require('./routes/vision')

const braintreeRoutes = require('./routes/braintree')

//app
const app = express();

//db
mongoose.connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then(() => console.log("DB Connected"))
    .catch((ero) => console.log(ero));

//midddleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());


 
//routes middlewares
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',productRoutes);
app.use('/api',orderRoutes);
app.use('/api',dboyRoutes);
app.use('/api',bannerRoutes);
app.use('/api',brandRoutes);
app.use('/api',photoRoutes);
app.use('/api',packageRoutes);
app.use('/api',prescriptionfileRoutes);
app.use('/api', visionRoutes);
app.use('/api', braintreeRoutes);


app.use(express.static("build"));
app.use('/*',express.static("build_out2"));
//  app.get('/',express.static("build"));


// app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use('/',require('./routes/admin/testtxn'))
// app.use('/',require('./routes/admin/pgredirect'))
// app.set('views', __dirname + '/views');

// app.set('view engine', 'ejs');


const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`server runnig on por:${port}`);
})