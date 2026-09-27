// server.js

import chalk from 'chalk';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('📝 Posts API — Refactored'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://localhost:${PORT}`));
  console.log(chalk.white(`🔧 Environment:  ${NODE_ENV}`));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:         ${process.version}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n📁 Project Structure:'));
  console.log(chalk.gray('   src/'));
  console.log(chalk.gray('   ├── app.js                 (Express app setup)'));
  console.log(chalk.gray('   ├── routes/'));
  console.log(chalk.gray('   │   ├── index.js           (Central router)'));
  console.log(chalk.gray('   │   └── posts.routes.js    (Post routes)'));
  console.log(chalk.gray('   ├── controllers/'));
  console.log(chalk.gray('   │   └── posts.controller.js (HTTP handlers)'));
  console.log(chalk.gray('   ├── services/'));
  console.log(chalk.gray('   │   └── posts.service.js   (Business logic)'));
  console.log(chalk.gray('   ├── middleware/'));
  console.log(chalk.gray('   │   └── errorHandler.js'));
  console.log(chalk.gray('   ├── errors/'));
  console.log(chalk.gray('   │   └── AppError.js'));
  console.log(chalk.gray('   ├── utils/'));
  console.log(chalk.gray('   │   └── validate.js'));
  console.log(chalk.gray('   └── data/'));
  console.log(chalk.gray('       └── store.js'));
  console.log(chalk.yellow('\n🧪 Try these:'));
  console.log(chalk.gray('   curl http://localhost:3000/api'));
  console.log(chalk.gray('   curl http://localhost:3000/api/posts'));
  console.log(chalk.gray('   curl http://localhost:3000/api/posts/1'));
  console.log('='.repeat(60) + '\n');
});