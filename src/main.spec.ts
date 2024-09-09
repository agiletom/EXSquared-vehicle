import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('Main Bootstrap', () => {
  test('should bootstrap the application and set up global pipes', async () => {
    const appMock = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(true),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(appMock);

    const { bootstrap } = await import('./main');
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);

    // Check how many times `useGlobalPipes` was called
    expect(appMock.useGlobalPipes).toHaveBeenCalledTimes(2);

    expect(appMock.enableCors).toHaveBeenCalled();
    expect(appMock.listen).toHaveBeenCalledWith(3000);
  });
});
