
exports.realTime_Socket = (io) => {
console.log(io.on);

io.on('connection' , (socket) => {
    console.log("fff" , socket );
    

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
})

}