from window_manager import get_focused_window_title, press_f10,pyqt, change_type
from flask import Flask, request, jsonify,send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from tkinter import filedialog
from threading import Thread
from copy import deepcopy
import tkinter as tk
import shutil
import json
import time
import os
import webbrowser

init_load=False
app = Flask(__name__)
update=False
webview=None
cors=CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
default={
    "dir":"",
    "list":[],
    "presets":[
       
    ],
    "categories":[
 { "name": "*Uncategorized", "icon": "/assets/ques.png" },
		{ "name": "Alto", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c4ff33f3b.png" },
		{ "name": "Baizhi", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c39f41dda.png" },
		{ "name": "Brant", "icon": "https://images.gamebanana.com/img/ico/ModCategory/67c981a895579.png" },
		{ "name": "Calcharo", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c5f44ca4e.png" },
		{ "name": "Camellya", "icon": "https://images.gamebanana.com/img/ico/ModCategory/675b7f303af84.png" },
		{ "name": "Cantarella", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6812a36c23457.png" },
		{ "name": "Carlotta", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6812a3cf60524.png" },
		{ "name": "Changli", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c68095b05.png" },
		{ "name": "Chixia", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c25a55aad.png" },
		{ "name": "Danjin", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c49eef2b5.png" },
		{ "name": "Encore", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c41aafe7c.png" },
		{ "name": "Jianxin", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c6300cb95.png" },
		{ "name": "Jinhsi", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c65ae3201.png" },
		{ "name": "Jiyan", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c4cec9dfe.png" },
		{ "name": "Lingyang", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c56786bfb.png" },
		{ "name": "Lumi", "icon": "https://images.gamebanana.com/img/ico/ModCategory/675b1120b010b.png" },
		{ "name": "Mortefi", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c52684f89.png" },
		{ "name": "Pheobe", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6812a40cb85a4.png" },
		{ "name": "Roccia", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6812a44645b98.png" },
		{ "name": "Rover(F)", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c35cd412e.png" },
		{ "name": "Rover(M)", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c30d33704.png" },
		{ "name": "Sanhua", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c3d32a078.png" },
		{ "name": "Shorekeeper", "icon": "https://images.gamebanana.com/img/ico/ModCategory/66f8c47b49ee8.png" },
		{ "name": "Taoqi", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c451a74aa.png" },
		{ "name": "Verina", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c2db4c218.png" },
		{ "name": "Xiangli Yao", "icon": "https://images.gamebanana.com/img/ico/ModCategory/66bddde6d44ed.png" },
		{ "name": "Yangyang", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c230d99e1.png" },
		{ "name": "Yinlin", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c5b7aea39.png" },
		{ "name": "Youhu", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6812a47de960d.png" },
		{ "name": "Yuanwu", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6683c591329e5.png" },
		{ "name": "Zani", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6812a2f8ddacc.png" },
		{ "name": "Zhezhi", "icon": "https://images.gamebanana.com/img/ico/ModCategory/66bdde0a65151.png" },
		{ "name": "\\NPCs", "icon": "https://images.gamebanana.com/img/ico/ModCategory/66e0d90771ac5.png" },
		{ "name": "\\Other", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png" },
		{ "name": "\\UI", "icon": "https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png" }
],
"settings":{
    "hot_keys":[],
    "hot_reload":True,
    "toggle":1,
    "open":0,
    "opacity":1,
    "type":0,
    "list_type":0

}
}
data=deepcopy(default)
running = True
logs = []   

def log(message):
    #log activity
    logs.append(message)
    print(message)

def save_log():
    # Save logs to a file
    global logs
    with open('log.txt', 'a') as f:
        for message in logs:
            f.write(message + '\n')
    # Clear the logs after saving
    logs= []  

def ask_dir():  
    # Open prompt for directory
    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True) 
    directory_path = filedialog.askdirectory(parent=root)
    root.attributes('-topmost', False)
    root.destroy()
    if directory_path:
        data["dir"]=directory_path.replace("\\","/")
        log("Ask mod dir: "+directory_path)
    else:
        return None
    return directory_path

def ask_file():
    # Open prompt for file (preview image)
    root=tk.Tk()
    root.withdraw()
    root.attributes('-topmost',True)
    file_path=filedialog.askopenfilename(parent=root).replace("\\","/")
    root.attributes('-topmost',False)
    root.destroy()
    return file_path

def custom_sort_key(s):
    if s.startswith('DISABLED_') and len(s) > 9:       
        marker    = s[9]            
        remainder = s[10:]           
    else:
        marker=s[0]
        remainder=s[1:] 
    #Remove 'DISABLED_' from the start of the string if it exists, to treat it like normal
    #Treat uppercase and lowercase letters equally when comparing to other letters, but keep lowercase before uppercase
    return (
            marker.lower(),
            marker.isupper(),
            remainder.casefold()
        )

def cat_sort_key(s):
    s=s["name"]
    prefix="2"
    # * => Important
    # \ => Unimportant
    if s.startswith('*'):
        prefix    = "1"          
        marker    = s[1]           
        remainder = s[2:]
    elif s.startswith("\\"):
        prefix    ="3"
        marker    = s[1]           
        remainder = s[2:]       
    else:
        marker=s[0]
        remainder=s[1:]
    return (
            prefix,
            marker.lower(),
            marker.isupper(),
            remainder.casefold()
        )

def check_appdata():
    # Check if the mod directory exists in the appdata folder
    log("Check %APPDATA%/XXMI Launcher/WWMI/Mods")
    if(os.path.isdir(os.path.join(os.getenv('APPDATA'), 'XXMI Launcher',"WWMI","Mods"))):
        data["dir"]=os.path.join(os.getenv('APPDATA'), 'XXMI Launcher',"WWMI","Mods")
        log("Set mod dir: "+data["dir"])
        return True
    ask_dir()
    return False

def truthify(s):
    s=s.replace("\\","/")
    s=s.split("/")  
    for i in range(len(s)):
        s[i]=s[i][9:] if s[i].startswith("DISABLED_") else s[i]
    #Remove 'DISABLED_' from the start of the string if it exists, to treat it like normal
    return ("/").join(s)


def refresh_dir(subdir=""):
    # Refresh the directory content and update the list of mods
    subdir=subdir.replace("\\","/")
    path=truthify(subdir)
    if not data["dir"]:
        check_appdata()
    try:
        temp=sorted(os.listdir(os.path.join(data["dir"],subdir)), key=custom_sort_key)
        for i in range(len(temp)):
            e=temp[i]
            name=truthify(e)
            isdir=os.path.isdir(os.path.join(data["dir"],subdir,e))
            category="*Uncategorized"
            description="No description"
            link=""
            enabled=not e.startswith("DISABLED_")
            exists = False
            for i in range(len(data["list"])):
                ele=data["list"][i]
                if ele["name"]==name and ele["path"]==path:
                    data["list"][i]["enabled"]=enabled
                    data["list"][i]["exists"]=True
                    exists=True
                    break
            if exists:
                continue
            #try to auto detect category
            if category=="*Uncategorized":
                temp2=deepcopy(data["categories"])
                for i in temp2:
                    prefix=""
                    if(i["name"][0]=="*" or i["name"][0]=="\\"):
                        prefix=i["name"][0]
                        i["name"]=i["name"][1:]
                    if i["name"].lower() in e.lower() and i["name"]!="Uncategorized":
                        category=prefix+i["name"]
                        break
            data["list"].append({
                "name":name,
                "path":path,
                "isdir":isdir,
                "category":category,
                "description":description,
                "link":link,
                "enabled":enabled,
                "exists":True
            })
 
        log("Refresh dir "+subdir)
        
    except:
        ask_dir()   

    new=[]
    for i in data["list"]:
        if i["path"]==path:
            try:
                if i["exists"]:
                    i["exists"]=False
                    new.append(i)
            except:
                pass
    return new

def save_congif():
    # Save the current configuration to a JSON file
    try:
        with open('config.json', 'w') as file:
            json.dump(data,file)
        log("Save config")
        return True
    except:
        return False

def reset_config():
    # Reset the configuration to default values
    global data
    data=deepcopy(default)
    log("Data reset")
    check_appdata()
    refresh_dir()
    save_congif()
try:
    # Load the configuration from a JSON file if it exists
    with open('config.json', 'r') as file:
        file = json.load(file)
        data["dir"] = file["dir"]
        data["categories"]=file["categories"]
        data["list"]=file["list"]
        data["settings"]=file["settings"]
        if(file["presets"]):
            data["presets"]=file["presets"]
except:
    log("No config file found, using default values")
    init_load=True

# Sort the categories
data["categories"]=sorted(data["categories"],key=cat_sort_key)

if not data["dir"]:
    check_appdata()
else:
    refresh_dir()

save_congif()

# Flask routes

#---------------------------------------------------------------------------------------- Serving Files

@app.route("/") # Serve the index.html file
@cross_origin()
def index():
    return send_from_directory('','index.html')

@app.route("/assets/<file>") # Serve static files from the assets directory
@cross_origin()
def static_files(file):
    return send_from_directory("","assets/"+file)

def try_combinations(path):
    path=path.replace("\\","/")
    path=path.replace("%20","")
    path_copy=deepcopy(path).split("/")
    path_len=len(path_copy)
    counter=bin(int("1"*path_len,2))[2:]
    path=os.path.join(data["dir"],path)
    while (not (os.path.isdir(path) or os.path.isfile(path)) and int(counter,2)>0):
        counter=bin(int(counter,2)-1)[2:]
        while len(counter)<path_len:
            counter="0"+counter
        path=""
        for i in range(path_len):
            if counter[i]=="1":
                path+=path_copy[i]+"/"
            else:
                path+="DISABLED_"+path_copy[i]+"/"
        path=path[:-1]
        path=os.path.join(data["dir"],path)
        path=path.replace("\\","/")
    if(os.path.isdir(path) or os.path.isfile(path)):
        return path
    else:
        return None

@app.route("/files/<path:subpath>") # Get the preview image of a file
@cross_origin()
def get_files(subpath):
    subpath=subpath.split("?")[0]
    if(subpath==""):
        return jsonify({"status":"err","message":"No path"})
    exts=["png","jpg","jpeg","webp","gif"]
    ext="png"
    path=try_combinations(subpath)
    try:
        if not path:
            return jsonify({"status":"err","message":"Not a valid directory"})
        files_list=os.listdir(path)
        for i in exts:
            ext=i
            if ("preview."+ext )in files_list:
                break
    except:
        pass
    return send_from_directory(path,'preview.'+ext)

#---------------------------------------------------------------------------------------- Modifying Content

@app.route("/list",methods=["POST"]) # Get the list of mods and their properties
@cross_origin()
def list():
    global init_load, running
    running = True
    data_get=request.get_json(force=True)
    req=data_get["req"]
    rsp={}
    if(req=="all"):
        rsp=deepcopy(data)
        rsp["list"]=refresh_dir()
        rsp["tutor"]=init_load
        rsp["user"]=""
        if(init_load):
            rsp["user"]=os.getlogin()
            init_load=False
        return jsonify(rsp)
    elif(req=="dir"):
        cwd=os.path.join(data["dir"],data_get["path"])
        if not os.path.isdir(cwd):
            cwd=try_combinations(data_get["path"])
            if not cwd or not os.path.isdir(cwd):
                return jsonify({"status":"err","message":"Not a valid directory"})
        if(data_get["path"]==""):
            rsp["list"]=refresh_dir()
        else:
            rsp["list"]=refresh_dir(cwd.replace(data["dir"]+"/",""))
    rsp["status"]="ok"
    return jsonify(rsp)

@app.route("/setpresets", methods=['POST']) # Modify the presets in the configuration
@cross_origin()
def set_presets():
    data_get=request.get_json(force=True)
    data["presets"]=data_get["presets"]
    if save_congif():
        log("Save preset")
        global update
        update=True
        return jsonify({"status":"ok"})
    else:
        return jsonify({"status":"err"})
    
@app.route("/toggle/<path:subpath>")
@cross_origin()
def toggle(subpath):
    global data
    if(subpath==""):
        return jsonify({"status":"err","message":"No path"})
    path=subpath.replace("%20"," ").replace("\\","/").split("/")  
    true_name=path[-1]
    old=deepcopy(true_name)
    if(len(path)>1):
        path=try_combinations("/".join(path[:-1]))
        if not path:
            return jsonify({"status":"err","message":"Not a valid directory"})    
    else:
        path=data["dir"]
    if(os.path.isdir(os.path.join(path,old)) or os.path.isfile(os.path.join(path,old))):
        new="DISABLED_"+old
    else:
        new = old
        old ="DISABLED_"+old
    try:
        os.rename(os.path.join(path,old),os.path.join(path,new))
        log("Toggle "+old+" to "+new)
        path=path.replace(data["dir"]+"/","")
        for i in range(len(data["list"])):
            ele=data["list"][i]
            if ele["name"]==true_name and ele["path"]==truthify(path):
                data["list"][i]["enabled"]=not data["list"][i]["enabled"]
                save_congif()
                break
        global update
        update=True
        return jsonify({"status":"ok","name":os.path.join(path,new)})
    except:
        return jsonify({"status":"err","message":"Not a valid directory"})

@app.route('/rename') # Rename a file or directory
@cross_origin()
def rename():
    global data
    frm=request.args.get('from')
    to=request.args.get('to')
    cwd=request.args.get('cwd')
    prefix=""
    if(cwd==""):
        cwd=data["dir"]
    else:
        cwd=try_combinations(cwd)
        if not cwd or not os.path.isdir(cwd):
            return jsonify({"status":"err","message":"Not a valid directory"})
    frm=frm.replace("%20"," ").replace("\\","/")
    to=to.replace("%20"," ").replace("\\","/")
    frm=frm.split("/")[-1]
    to=to.split("/")[-1]
    if(frm==to):
        return jsonify({"status":"err","message":"No change"})
    if(not os.path.isdir(os.path.join(cwd,frm)) and not os.path.isfile(os.path.join(cwd,frm))):
        prefix="DISABLED_"
    try:
        os.rename(os.path.join(cwd,prefix+frm),os.path.join(cwd,prefix+to))
        cwd=cwd.replace(data["dir"]+"/","/")
        for i in range(len(data["list"])):
            ele=data["list"][i]
            if ele["name"]==frm and ele["path"]==truthify(cwd):
                data["list"][i]["name"]=to
                save_congif()
                break
        global update
        update=True
        return jsonify({"status":"ok"})
    except:
        return jsonify({"status":"err","message":"Not a valid directory"})  
    
@app.route("/set/<type>",methods=["POST"]) # Set a property of a file or directory (description or link)
@cross_origin()
def set_link(type):
    global data
    data_get=request.get_json(force=True)
    name=data_get["name"]
    dt=data_get[type]
    log("Set "+name+" "+type+" to "+dt)
    for i in range(len(data["list"])):
        ele=data["list"][i]
        if(ele["name"]==name):
            data["list"][i][type]=dt
            save_congif()
            break
    return jsonify({"status":"ok"})

#----------------------------------------------------------------------------------------

@app.route("/reset", methods=['GET']) # Reset the configuration to default values
@cross_origin()
def reset():
    log("Initiate reset")
    reset_config()
    return jsonify(data)

@app.route("/open/") # Open a file or directory in the file explorer
@cross_origin()
def open_path():
    path=request.args.get('path')
    path=try_combinations(path).replace("/","\\").replace("\\","\\\\")
    log("Open "+path)
    os.startfile(repr(path)[1:-1])
    return jsonify({"status":"ok"})

@app.route("/askdir", methods=['GET']) # Ask the user to select a directory
@cross_origin()
def dir_content():
    log("Change cwd")
    rsp={"status":"ok"}
    try:
        rsp["dir"]=ask_dir()
        if(not rsp["dir"]):
            raise Exception("No dir")
        rsp["list"]=refresh_dir()
        save_congif()
    except:
        log("Ask dir err")
        rsp["status"]="err"
    return jsonify(rsp)

@app.route("/applypreset/<i>", methods=['GET']) # Apply a preset to the mod directory
@cross_origin()
def apply_content(i):
    try:
        log("Apply preset")
        preset=data["presets"][int(i)]["data"]
        for dt in preset:
            if dt["enabled"]:
                try:
                   os.rename(os.path.join(data["dir"],"DISABLED_"+dt["name"]),os.path.join(data["dir"],secure_filename(dt["name"]))) 
                except:
                    pass
            else:
                try:
                   os.rename(os.path.join(data["dir"],dt["name"]),os.path.join(data["dir"],secure_filename("DISABLED_"+dt["name"]))) 
                except:
                    pass
        global update
        update=True
        return jsonify({"status":"ok","list":refresh_dir()})
    except:
        log("Apply preset err")
        pass
    return jsonify({"status":"err"})

@app.route('/savepreview', methods=['POST']) # Save the preview image to the specified directory
@cross_origin()
def change_preview_content():
    data_get=request.get_json(force=True)
    frm=ask_file()
    if(frm):
        to=data_get["to"]
        path=os.path.join(*to)
        exts=["png","jpg","jpeg","webp","gif"]
        ext="png"
        if(not os.path.isdir(path)):
            path=try_combinations(path)
            if not path or not os.path.isdir(path):                
                return jsonify({"status":"cannot set preview to a file"})
        files_list=os.listdir(path)
        for i in exts:
            ext=i
            if ("preview."+ext )in files_list:
                os.remove(os.path.join(path,"preview."+ext))
        to=path.split("/")
        to.append("preview."+frm.split(".")[-1])
        to="/".join(to)
        shutil.copyfile(frm, to)
        log("Save preview "+frm+" to "+to)
    return jsonify({"status":"ok"})

@app.route('/savesettings', methods=['POST']) # Save the configuration to a file
@cross_origin()
def save_settings():
    global data
    data_get=request.get_json(force=True)
    try:
        if(data_get["settings"]["type"]!=data["settings"]["type"]):
            change_type(data_get["settings"]["type"])
    except:
        pass
    data["settings"]=data_get["settings"]
    if save_congif():
        log("Save settings")
        global update
        update=True
        return jsonify({"status":"ok"})
    else:
        return jsonify({"status":"err"})
    
@app.route('/openlink', methods=['GET'])
@cross_origin()
def open_link():
    link=request.args.get('link')
    if(link):
        webbrowser.open(link)
        log("Open link "+link)
        return jsonify({"status":"ok"})
    else:
        return jsonify({"status":"err","message":"No link"})
    
@app.route('/quit', methods=['GET']) # Used to stop the server after 2 seconds on closing the tab
@cross_origin()
def quit_app():
    global running
    running = False
    log("Quit")
    save_log()
    return jsonify({"status":"ok"})

def run_flask():
    from waitress import serve
    print("Server started at ", "http://127.0.0.1:2110/")
    # app.run(host='0.0.0.0', port=2110, threaded=True)
    serve(app, port=2110)

# import keyboard
# def focus_webview():
    
#     activate_window("")

# keyboard.add_hotkey('ctrl+9', focus_webview)


def runner():
    global update
    while running:
        window=get_focused_window_title()
        if(str(window).strip().lower()=="wuthering waves") and update and data["settings"]["hot_reload"]:
            update=False
            press_f10()
        time.sleep(1)

if __name__ == '__main__':
    # Start the Flask app in a separate thread
    flask_thread = Thread(target=run_flask,daemon=True)
    flask_thread.start()
    event_thread = Thread(target=runner,daemon=True)

    try:

        if(data["settings"]["open"]==1):
            webbrowser.open("http://127.0.0.1:2110/", new=0, autoraise=True)
            runner()
        else:
            event_thread.start()
            pyqt(data["settings"]["type"],data["settings"]["opacity"])

        # webview.create_window("WWMM Launcher", "http://127.0.1:2110/", width=1200, height=800, resizable=True,on_top=True)
        # webview.start()
        raise KeyboardInterrupt
    
    except KeyboardInterrupt:
        exit(0)
    
    