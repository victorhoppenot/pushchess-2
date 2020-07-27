import org.java_websocket.WebSocket;
import org.java_websocket.server.WebSocketServer;

import java.util.ArrayList;
import java.util.Random;

public class Game {
    private String key1;
    private String key2;

    private String spectatorKey;

    private char name1 = 'w';
    private char name2 = 'b';

    private char playbw = 'b';

    public Game(String key1, String key2, String spectatorKey){
        this.key1 = key1;
        this.key2 = key2;
        this.spectatorKey = spectatorKey;
        Random rand = new Random();
        int coin = rand.nextInt(2);
        if(coin == 0){
            name1 = 'b';
            name2 = 'w';
        }
    }

    public String[] getKeys(){
        return new String[]{key1, key2, spectatorKey};
    }

    public String play(String key, String playStr){
        char player = ' ';
        if(key.equals(key1)){
            player = name1;
        }else if(key.equals(key2)){
            player = name2;
        }else{
            return "close";
        }

        if(player != playbw){
            return "close";
        }


        return playStr;
    }
    public void regenKeys(){
        key1 = generateAlphanumeric();
        key2 = generateAlphanumeric();
        spectatorKey = generateAlphanumeric();
        while(key1.equals(key2) || key1.equals(spectatorKey) || key2.equals(spectatorKey)) {
            key1 = generateAlphanumeric();
            key2 = generateAlphanumeric();
            spectatorKey = generateAlphanumeric();
        }
    }

    private static String generateAlphanumeric() {
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();

        String generatedString = random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();

        return generatedString;
    }

    public void nextPlay(){
        if(playbw == 'b'){
            playbw = 'w';
        }else{
            playbw = 'b';
        }
    }

    public boolean allowedConnection(WebSocket conn) {
        return true;
    }

    public void join(String key, WebSocket conn){
        if(key.equals(key1) || key.equals(key2) || key.equals(spectatorKey)){
            //allowedConnections.add(conn);
            conn.send("setplayer " + getPlayer(key));
        }

    }

    private char getPlayer(String key){
        if(key.equals(key1)){
            return name1;
        }else{
            return name2;
        }
    }
}
