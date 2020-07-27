import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

public class GameServer extends WebSocketServer {
    public Game publicGame;
    public GameServer(int port) throws UnknownHostException {
        super(new InetSocketAddress(port));
        publicGame = new Game("p1", "p2", "p3");
    }
    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        //conn.send("Welcome to the server!"); //This method sends a message to the new client
        //broadcast( "new connection: " + handshake.getResourceDescriptor() ); //This method sends a message to all clients connected
        System.out.println(conn.getRemoteSocketAddress().getAddress().getHostAddress() + " connected " );
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println(conn.getRemoteSocketAddress().getAddress().getHostAddress() + " exited " );
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        System.out.println(conn.getRemoteSocketAddress().getAddress().getHostAddress() + " : " + message);
        String[] obj = message.split("\\s+");
        int len = obj.length;
        if(len < 1){
            return;
        }
        String command = obj[0];
        System.out.println("Running command: " + command);
        switch(command){
            case "join": {
                if (len < 3) {
                    break;
                }
                String key = obj[1];
                String name = obj[2];
                System.out.println(name + " joining with key: \"" + key + "\"");
                /*if(publicGame.allowedConnection(conn)){
                    System.out.println(name + " is already in the game!");
                    break;
                }*/
                publicGame.join(key, conn);
                System.out.println(name + " joined!");
                break;
            }
            case "play": {
                if (len < 3) {
                    break;
                }
                String key = obj[1];
                String playStr = obj[2];

                String action = publicGame.play(key, playStr);
                if(action.equals("close")){
                    conn.close();
                    break;
                }
                broadcast("play " + playStr);
                break;
            }
            case "win": {
                break;
            }
            case "switch": {
                publicGame.nextPlay();
                broadcast("switch");
                break;
            }
            default:
                conn.close();
                break;
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
        if( conn != null ) {
            // some errors like port binding failed may not be assignable to a specific websocket
        }
    }

    @Override
    public void onStart() {
        System.out.println("Server started!");
        setConnectionLostTimeout(0);
        setConnectionLostTimeout(100);
    }
}
