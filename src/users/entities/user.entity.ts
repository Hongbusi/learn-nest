import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Permission, PermissionType } from '../../iam/authorization/permission.type'
import { Role } from '../enums/role.enum'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ type: 'enum', enum: Role, default: Role.Regular })
  role: Role

  @Column({ type: 'json', enum: Permission, default: [] })
  permissions: PermissionType[]
}
