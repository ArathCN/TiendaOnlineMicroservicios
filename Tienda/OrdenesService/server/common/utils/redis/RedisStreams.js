import { commandOptions } from "redis";
import RedisClient from "./RedisClient.js";

class ListenStreamOptions {

    /**
     * 
     * @param {Array<Object>} streams - {streamKeyName: string, eventHandler: function}
     * @param {String} groupName - Nombre del grupo consumidor.
     * @param {String} consumerName - Nombre del consumidor dentro del grupo.
     * @param {Number} maxNoOfEntriesToReadAtTime - Número máximo de entradas que recibirá por cada llamada.
     */
    constructor(streams, groupName, consumerName, maxNoOfEntriesToReadAtTime){
        this.streams = streams
        this.groupName = groupName;
        this.consumerName = consumerName;
        this.maxNoOfEntriesToReadAtTime = maxNoOfEntriesToReadAtTime;
    }
}

class RedisStreams {
    
    /**
     * 
     * @param {ListenStreamOptions} listenStreamOptions - Lista de streams a escuchar así como los datos de identificación.
     */
    static async listenToStreams(listenStreamOptions) {
        /*
           (A) create consumer group for the stream
           (B) read set of messages from the stream
           (C) process all messages received
           (D) trigger appropriate action callback for each message
           (E) acknowledge individual messages after processing
          */

        const nodeRedisClient = await RedisClient.getInstance();

        if (!nodeRedisClient){
            console.log(nodeRedisClient);
            return;
        }

        const streams = listenStreamOptions.streams;
        const groupName = listenStreamOptions.groupName;
        const consumerName = listenStreamOptions.consumerName;
        const readMaxCount = listenStreamOptions.maxNoOfEntriesToReadAtTime || 100;
        const idInitialPosition = '0'; //0 = start, $ = end or any specific id
        const streamKeyIdArr = []; //{key: string, id: string}
      
        await Promise.all(
            streams.map(async (stream) => {
                console.log(`Creating consumer group ${groupName} in stream ${stream.streamKeyName}`);
            
                try {
                    // (A) create consumer group for the stream
            
                    await nodeRedisClient.xGroupCreate(
                    stream.streamKeyName,
                    groupName,
                    idInitialPosition,
                    {
                        MKSTREAM: true,
                    },
                    );
                } catch (err) {
                    console.log(`Consumer group ${groupName} already exists in stream ${stream.streamKeyName}!`);
                }
            
                streamKeyIdArr.push({
                    key: stream.streamKeyName,
                    id: '>', // Next entry ID that no consumer in this group has read
                });
            })
        );
      
        console.log(`Starting consumer ${consumerName}.`);
      
        while (true) {
            try {
                // (B) read set of messages from different streams
                const dataArr = await nodeRedisClient.xReadGroup(
                commandOptions({
                    isolated: true,
                }),
                groupName,
                consumerName,
                //can specify multiple streams in array [{key, id}]
                streamKeyIdArr,
                {
                    COUNT: readMaxCount, // Read n entries at a time
                    BLOCK: 5, //block for 0 (infinite) seconds if there are none.
                },
                );
        
                // dataArr = [
                //   {
                //     name: 'streamName',
                //     messages: [
                //       {
                //         id: '1642088708425-0',
                //         message: {
                //           key1: 'value1',
                //         },
                //       },
                //     ],
                //   },
                // ];
        
                //(C) process all messages received
                if (!dataArr || !dataArr.length) // LoggerCls.info('No new stream entries.');
                continue;

                for (let data of dataArr) {
                    for (let messageItem of data.messages) {
                        const streamKeyName = data.name;
            
                        const stream = streams.find(
                            (s) => s.streamKeyName == streamKeyName,
                        );
            
                        if (stream && messageItem.message) {
                            const streamEventHandler = stream.eventHandler;
                            
                            //Si ocurrió algún error el procesar la entrada entonces no se confirma con Redis
                            try {
                                await streamEventHandler(messageItem.message, messageItem.id);

                                //(E) acknowledge individual messages after processing
                                nodeRedisClient.xAck(streamKeyName, groupName, messageItem.id);

                                console.log(`La entrada '${messageItem.id}' fue procesada correctamente.`);
                            } catch (error) {
                                console.log(`Error en la entrada '${messageItem.id}' => ${error.message}`);
                            }
                        }
                    }
                }
            } catch (err) {
                console.log('xReadGroup error !', err);
            }
        }
    }

    /**
     * 
     * @param {ListenStreamOptions} listenStreamOptions 
     * @returns 
     */
    static async checkPendingEntries(listenStreamOptions) {
        const nodeRedisClient = await RedisClient.getInstance();

        const streams = listenStreamOptions.streams;
        const groupName = listenStreamOptions.groupName;
        const consumerName = listenStreamOptions.consumerName;
        const readMaxCount = listenStreamOptions.maxNoOfEntriesToReadAtTime || 100;

        if (!nodeRedisClient){
            console.log(nodeRedisClient);
            return;
        }

        let streamsWithPendingEntries = [];

        await Promise.all(
            streams.map(async (stream) => {

                //revisar si el grupo ya existe, de lo contrario lo ingresamos el stream a la lista.
                const consumerGroups = await nodeRedisClient.xInfoGroups(stream.streamKeyName);
                console.log("stream: ", stream.streamKeyName, " grupos:", consumerGroups);
                const groupIndex = consumerGroups.findIndex(cg => cg.name == groupName);
                if(groupIndex == -1){
                    console.log(`No hay un grupo creado para el stream '${stream.streamKeyName}'`);
                    return;
                }

                const pendingEntries = await nodeRedisClient.xPending(stream.streamKeyName, groupName);

                if(!pendingEntries.pending){
                    console.log(`No hay entradas pendientes para el stream ${stream.streamKeyName}`);
                    return;
                }

                const pendingStream = pendingEntries.consumers.find(c => c.name == consumerName);
                if(!pendingStream){
                    console.log(`No hay entradas pendientes para el consumidor en el stream ${stream.streamKeyName}`);
                    return;   
                }

                streamsWithPendingEntries.push({
                    key: stream.streamKeyName,
                    id: "0", // Comenzará desde la primera entrada que se recibió pero no se confirmó
                });

                console.log("stream: ", stream.streamKeyName, " entradas pendientes: ", pendingEntries);
            })
        );

        if(!streamsWithPendingEntries.length) {
            console.log("No hay entradas pendientes para ningun stream especificado");
            return;
        }

        
        let dataArr = null;
        let condicion = true;
        try {
            do {
                dataArr = await nodeRedisClient.xReadGroup(
                    groupName,
                    consumerName,
                    streamsWithPendingEntries,
                    {
                        COUNT: readMaxCount // Read n entries at a times
                    }
                );
                
                //Comprueba si al menos un stream tiene un mensaje
                condicion = dataArr.some((s) => s.messages.length > 0);
                console.log(dataArr);

                for (let data of dataArr) {
                    for (let messageItem of data.messages) {
                        const streamKeyName = data.name;
            
                        const stream = streams.find(
                            (s) => s.streamKeyName == streamKeyName,
                        );
            
                        if (stream && messageItem.message) {
                            const streamEventHandler = stream.eventHandler;

                            //Si ocurrió algún error el procesar la entrada entonces no se confirma con Redis
                            try {
                                await streamEventHandler(messageItem.message, messageItem.id);

                                //(E) acknowledge individual messages after processing
                                nodeRedisClient.xAck(streamKeyName, groupName, messageItem.id);

                                console.log(`La entrada '${messageItem.id}' fue procesada correctamente.`);
                            } catch (error) {
                                console.log(`Error en la entrada '${messageItem.id}' => ${error.message}`);
                            }
                        }
                    }
                }
            } while (condicion);
        } catch (err) {
            console.log('xReadGroup error !', err);
        }

        console.log("Han sido procesadas todas las entradas pendientes");
    }

    static async addMessageToStream(message, streamKeyName) {
        try {
            const nodeRedisClient = await RedisClient.getInstance();

            if (!nodeRedisClient){
                console.log("Cliente Redis error", nodeRedisClient);
                return;
            }

            const id = '*'; //* = auto generate
            await nodeRedisClient.xAdd(streamKeyName, id, message);
        } catch (err) {
            console.log('addMessageToStream error !', err);
            console.log(streamKeyName, message);
        }
    }
}

export {ListenStreamOptions, RedisStreams};