import { Module } from '@nestjs/common';
import { ClientsModule, GrpcOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

function getProtoPath(protoFile: string): string {
  return join(
    process.cwd(),
    'dist/packages/backend/grpc-contracts/src/protos',
    protoFile
  );
}

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (): GrpcOptions => ({
          transport: Transport.GRPC,
          options: {
            package: 'io.ninenine.auth.v1',
            protoPath: getProtoPath('auth/v1/authsvc.proto'),
            url: '0.0.0.0:5001',
          },
        }),
      },
      {
        name: 'USER_SERVICE',
        useFactory: (): GrpcOptions => ({
          transport: Transport.GRPC,
          options: {
            package: 'io.ninenine.user.v1',
            protoPath: getProtoPath('user/v1/usersvc.proto'),
            url: '0.0.0.0:5002',
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RpcModule {}
