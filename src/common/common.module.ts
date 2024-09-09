import { Module } from '@nestjs/common';
import { ParseXmlService } from './services/parse-xml.service';

@Module({
  providers: [ParseXmlService],
  exports: [ParseXmlService], // Export the service so it can be used in other modules
})
export class CommonModule {}
