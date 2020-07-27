import org.java_websocket.WebSocket;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {

    public static void main(String[] args) throws IOException, InterruptedException {
        int port = 25565;
        GameServer gS = new GameServer(port);
        gS.start();
        System.out.println("GameServer starting on port " + gS.getPort());

        BufferedReader sysin = new BufferedReader(new InputStreamReader(System.in));
        while(true) {
            String in = sysin.readLine();
            if(in.equals("reset")){
                for(WebSocket conn : gS.getConnections()){
                    conn.close();
                }
                gS.publicGame = new Game("p1", "p2", "p3");
                System.out.println("Game Reset");
            }else if(in.equals("exit")){
                gS.stop(1000);
                break;
            }else{
                gS.broadcast(in);
                System.out.println("Sending: " + in);
            }
        }
    }
}
