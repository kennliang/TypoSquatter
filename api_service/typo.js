// make sure node and npm is install. Open the terminal in visual studio code and type "node typo.js" to run the file



class WebsiteTypo{
    constructor(website_url)
    {
        this.website = website_url;
        //ex : ".com" , ".org", ".net", ".io", etc.
        this.domain_name = website_url.substring(website_url.lastIndexOf("."));
        this.typo_list = new Array();
        this.keysAdjTo = {
            1 : ["q", "2"],
            2 : ["w", "q", "1", "3"],
            3 : ["e", "w", "2", "4"],
            4 : ["r", "e", "3", "5"],
            5 : ["t", "r", "4", "6"],
            6 : ["y", "t", "5", "7"],
            7 : ["u", "y", "6", "8"],
            8 : ["i", "u", "7", "9"],
            9 : ["o", "i", "8", "0"],
            0 : ["p", "o", "9"],
            q : ["1", "2", "w", "a"],
            w : ["s", "a", "q", "2", "3", "e"],
            e : ["d", "s", "w", "3", "4", "r"],
            r : ["f", "d", "e", "4", "5", "t"],
            t : ["g", "f", "r", "5", "6", "y"],
            y : ["h", "g", "t", "6", "7", "u"],
            u : ["j", "h", "y", "7", "8", "i"],
            i : ["k", "j", "u", "8", "9", "o"],
            o : ["l", "k", "i", "9", "0", "p"],
            p : ["l", "o", "0"],
            a : ["z", "s", "w", "q"],
            s : ["x", "z", "a", "w", "e", "d"],
            d : ["c", "x", "s", "e", "r", "f"],
            f : ["v", "c", "d", "r", "t", "g"],
            g : ["b", "v", "f", "t", "y", "h"],
            h : ["n", "b", "g", "y", "u", "j"],
            j : ["m", "n", "h", "u", "i", "k"],
            k : ["m", "j", "i", "o", "l"],
            l : ["k", "o", "p"],
            z : ["a", "s", "x"],
            x : ["z", "s", "d", "c"],
            c : ["x", "d", "f", "v"],
            v : ["c", "f", "g", "b"],
            b : ["v", "g", "h", "n"],
            n : ["b", "h", "j", "m"],
            m : ["n", "j", "k"]
        }
    }

    /*
    (1) Missing-dot typos: The “.” following “www” is
    removed, e.g., wwwSouthwest.com.
    */
    missing_dot()
    {
        let missing_str = this.website;
        missing_str = missing_str.slice(0, 3) + missing_str.slice(4);
        this.pushTypo(missing_str);
      
    }

    /*
    (2) Character-omission typos: Characters are omitted
    one at a time, e.g., Diney.com and MarthStewart.com.
    */
    char_omission()
    {
        let missing_str = this.website;
        let firstHalf = missing_str.substring(4, missing_str.length);
        let secondHalf = firstHalf.substring(1,firstHalf.length);
        this.pushTypo(secondHalf);

        var i;
        for(i = 0; i < missing_str.length-9; i++){
            firstHalf = missing_str.substring(4, missing_str.length);
            secondHalf = firstHalf.substring((i+2),firstHalf.length);
            this.pushTypo(firstHalf.substring(0,(i+1))+secondHalf );

        }
    }

    /*
    (3) Character-permutation typos: Consecutive
    characters are swapped one pair at a time, unless they
    are the same characters, e.g., NYTiems.com.
    */
    char_permut()
    {   
        var name = this.website.substring(this.website.indexOf(".") + 1 , this.website.indexOf(this.domain_name)).split("")
        var permut = name;
        for(var i = 0; i < name.length; i++){
            for(var j = i + 1; j < name.length; j++){
                var char = permut[i];
                permut[i] = permut[j];
                permut[j] = char;
                this.pushTypo("www." + permut.join("") + this.domain_name);
            }
        }
    }

    /*
    (4) Character-replacement typos: characters are
    replaced one at a time and the replacement is selected
    from the set of characters adjacent to the given character
    on the standard keyboard, e.g., DidneyWorld.com and
    USATodsy.com.
    */

    char_replace()
    {
        var name = this.website.substring(this.website.indexOf(".") + 1 , this.website.indexOf(this.domain_name));
        for(var i = 0; i < name.length - 1; i++){
            var adjacentKeys = this.keysAdjTo[name.charAt(i)];
            for(var j = 0; j < adjacentKeys.length; j++)
                this.pushTypo("www." + name.substring(0,i) + adjacentKeys[j] + name.substring(i+1) + this.domain_name);
        }
    }
    /*
    (5) Character-insertion typos: characters are inserted
    one at a time and the inserted character is chosen from
    the set of characters adjacent to either of the given pair
    on the standard keyboard (and including the given pair),
    e.g., WashingtonPoost.com and Googlle.com.
    */

    char_insert()
    {
        var name = this.website.substring(this.website.indexOf(".") + 1 , this.website.indexOf(this.domain_name));
        for(var i = 0; i < name.length - 1; i++){
            var adjacentKeys = this.keysAdjTo[name.charAt(i)];
            //inserts adjacent keyboard characters left and right of parsed character in url name
            for(var j = 0; j < adjacentKeys.length; j++){
                this.pushTypo("www." + name.substring(0,i) + adjacentKeys[j] + name.substring(i) + this.domain_name);
                this.pushTypo("www." + name.substring(0,i+1) + adjacentKeys[j] + name.substring(i + 1) + this.domain_name);
            }
            //inserts duplicate character next to parsed character in url name
            this.pushTypo("www." + name.substring(0,i+1) + name.substring(i) + this.domain_name);
        }
    }

    /*
    pushes a typo to the typo_list without pushing a pre-existing pushed typo
    */
    pushTypo(typo){
        if(this.typo_list.indexOf(typo) == -1)
        {
            this.typo_list.push(typo);
        }
    }
}

module.exports = WebsiteTypo;

