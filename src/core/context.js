﻿/*
* Context is one of the most important classes in boilerplate. This represents a sandboxed environment
* for writing group of functionalities. Contexts can be nested to create hierachies for complex 
* implementations. 
* For example, 
*      a product suit may have multiple products, 
*      and a product may have multiple modules,
*      and a module may have multiple submodules.
*
* It is possible to create such hierachies by nesting contexts. Context can provide several 
* necessary services such as 'settings store', 'pub-sub event infrastructure', 'logging', etc.
*/
define(['./helpers/mediator', './helpers/settings', './helpers/storage', './helpers/localizer'], function (Mediator, Settings, Storage, Localizer) {

    /*
    * This is the constructor function for the context and it takes a reference to a parent
    * context. If supplied, it will be initialized to support chaining of it's functionalities.
    * For example, all child contexts will inherit the settings of its parent contexts. Event notifications 
    * will bubble through the context hierachy so that inter context communication is possibe 
    * within a hierachy tree.
    *
    * Lets assign the function to a variable which we will be returning at the end of the script. Below
    * the constructor function, you can find instance methods for Context class. This might appear strange
    * since they are defined outside the class body and attached to 'prototype' of the class. Although it is 
    * possible to define methods within the class body, we use this approach for better performance. For
    * more information read about prototypes in javascripts.
    */
    var Context = function (parentContext) {
        this.parentContext = parentContext;
        this.mediator = this.parentContext ? this.parentContext.mediator : new Mediator();
        this.settings = this.parentContext ? new Settings(this.parentContext.settings) : new Settings();
    };

    /*
    * This is the method to get settings from the context. This will return a object that has 
    * settings as object properties. Consimers can simply use the settings property keys 
    * to retrieve values. For example, context.getSettings().base-server-url will look for a 
    * setting object defined under 'base-server-url' preperty.
    *
    * If context is a part of a context hierachy, the settings object returned will contain 
    * settings of all parent contexts. Settings from child contexts will override settings from 
    * parent contexts, if same key exists.
    *
    * To improve performance, it is a good practice to store the returned object and reduce the 
    * number of calls to this method.
    */
    Context.prototype.getSettings = function () {
        return this.settings.items();
    };

    /*
    * One can pass an object containing settings as properties in it. If the existing
    * settings contain properties with same key, those will be replaced.
    */
    Context.prototype.addSettings = function (newSettings) {
        this.settings.load(newSettings);
    };

    /*
    * This is the method to raise an event in the context. All subscribers in the same context hierachy
    * will be notified. first parameter is the event name as a string, and the next parameter is the 
    * event data as a object.
    */
    Context.prototype.notify = function (event, params) {
        this.mediator.notify(event, params);
    };

    /*
    * The method for subscribing to recieve events. first parameter is the name of the event you wish
    * to recieve. Next is the callback function incase event has occurred. Callback function may have a 
    * parameter in case it is interesting to recieve the event data as well. 
    */
    Context.prototype.listen = function (event, fn) {
        this.mediator.listen(event, fn);
    };

    /*
    * It is possible to use the context as a medium to share objects. Since context is usually
    * passed arround, it serves the purpose of sharing well.
    * @param {key} name of the object to store
    * @param {objectToStore} object to store in
    */
    Context.prototype.persistObject = function (key, objectToStore) {
        Storage.persist(key, objectToStore);
    };

    /*
    * Allows developers to retrieve objects that are stored (using 'store' method) in 
    * this context. 
    * @param {key} name of the object
    * @return The stored object if found, else 'undefined'
    */
    Context.prototype.retreiveObject = function (key) {
        return Storage.retreive(key);
    };
    
    /*
     * Removed the object stored in persistance store
     * @param {key} name of the object to be removed
     */
     Context.prototype.removeObject = function (key) {
         return Storage.remove(key);
     };
     
     /*
      * Set the language for the whole system. Will cause the page to refresh
      */
     Context.prototype.setLanguage = function (lang) {
         return Localizer.setLanguage(lang);
     };
     
     /*
      * Clear any language settings stored. Falls back to browser language detection
      */
     Context.prototype.clearLanguage = function () {
         return Localizer.clearLanguage();
     };
     

    /*
    * If someone is interested in obtaining the parent context, this method could be used. But it is not a
    * good practice to work directly on contexts other than your immediate. Instead use events to communicate.
    */
    Context.prototype.getParentContext = function () {
        return this.parentContext;
    };

    /**
    * Helper method to construct child contexts under this parent context.
    * Children will recieve a reference to this object through a constructor argument.
    */
    Context.prototype.loadChildContexts = function (children) {
        for (key in children) {
            var ChildContextClass = children[key];
            new ChildContextClass(this); //initializes the module
        }
    };

    //now we have built our Context class with methods. Lets return it so that callers may instantiate.
    return Context;
});