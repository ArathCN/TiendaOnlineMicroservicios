import RedisClient from "../common/utils/redis/RedisClient.js";
import { Repository, Schema } from 'redis-om';

const redisClient = await RedisClient.getInstance();

const UserSchema = new Schema("user", {
    id: {type: "string"},
    name: {type: "string"},
    email: {type: "string"},
    password: {type: "string"},
    permissions: {type: "string[]"}
});

const UsuarioRepository = new Repository(UserSchema, redisClient);

await UsuarioRepository.createIndex();

export default UsuarioRepository;