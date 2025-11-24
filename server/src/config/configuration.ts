export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  auth: {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES || 480,
  },
  database: {
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
    logging: process.env.TYPEORM_LOGGING === 'true',
    entities: (process.env.TYPEORM_ENTITIES
      ? process.env.TYPEORM_ENTITIES
      : 'dist/**/*.entity.ts'
    ).split(','),
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  },
  email: {
    transport: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      defaults: {
        from: process.env.EMAIL_DEFAULT_FROM_MAIL,
      },
    },
  },
});
